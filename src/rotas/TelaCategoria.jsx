import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import './TemaPadrao.css';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TopMenu from './TopMenu';
import 'react-datepicker/dist/react-datepicker.css';
import likeImage from '../assets/like.png';
import likedImage from '../assets/liked.png';
import trend from '../assets/trend.png';
import ellipsis from '../assets/ellipsis.png';
import publi from '../assets/write.png';
import comentarioImage from '../assets/comentario.png';

const TelaCategoria = () => {
    const { idCategoria } = useParams();
    const carregandoRef = useRef(false);
    const [categoria, setCategoria] = useState(null);
    const [categoriasDaPessoa, setCategoriasDaPessoa] = useState([]);
    const [isCategoriaAssociada, setIsCategoriaAssociada] = useState(false);
    const [publicacoes, setPublicacoes] = useState([]);
    const publicacoesContainerRef = useRef(null);
    const paginaRef = useRef(1);
    const [expandedOption, setExpandedOption] = useState(null);
    const [expandedContent, setExpandedContent] = useState({});
    const [expandedComments, setExpandedComments] = useState({});
    const [curtidasUsuario, setCurtidasUsuario] = useState(new Set());
    const [mostrarFormularioComentario, setMostrarFormularioComentario] = useState(false);
    const [comentarios, setComentarios] = useState({});

    useEffect(() => {
        if (publicacoesContainerRef.current) {
            const containerHeight = publicacoesContainerRef.current.offsetHeight;
            const maxHeight = 400;
            if (containerHeight > maxHeight) {
                publicacoesContainerRef.current.classList.add('content-expanded');
            } else {
                publicacoesContainerRef.current.classList.remove('content-expanded');
            }
        }
    }, [publicacoes]);

    useEffect(() => {
        const idPessoaAtual = Number(localStorage.getItem('idPessoa'));

        const publicacoesCurtidas = new Set();

        publicacoes.forEach(publicacao => {
            publicacao.publicacaoCurtidas.forEach(curtida => {
                if (curtida.pessoa.idPessoa === idPessoaAtual) {
                    publicacoesCurtidas.add(publicacao.idPublicacao);
                }
            });
        });

        setCurtidasUsuario(publicacoesCurtidas);
    }, [publicacoes]);

    useEffect(() => {
        const setupIntersectionObserver = () => {
            const intersectionObserver = new IntersectionObserver((entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    console.log('Sentinela appears!');
                    carregarMaisPublicacoes();
                }
            });

            const sentinela = document.getElementById('sentinela');
            if (sentinela) {
                intersectionObserver.observe(sentinela);
            }
        };

        setupIntersectionObserver();
        Promise.all([fetchAndSetCategoria(), fetchCategoriasDaPessoa()])
            .then(() => {
                setupIntersectionObserver();
                carregarMaisPublicacoes();
            })
            .catch((error) => {
                console.error("Error in promises:", error);
            });

        console.log("Componente montado / Atualizado!");
    }, []);


    const carregarMaisPublicacoes = async () => {
        await fetchPublicacoes();
    };

    const fetchPublicacoes = async () => {
        if (carregandoRef.current) {
            return;
        }

        try {
            carregandoRef.current = true;
            let response;

            let url = `http://localhost:8080/publicacoes?page=${paginaRef.current}`;
            if (idCategoria !== null) {
                url += `&idCategoria=${idCategoria}`;
            }

            response = await axios.get(url);

            if (response.status === 200) {
                const novasPublicacoes = response.data;
                setPublicacoes(prevPublicacoes => [...prevPublicacoes, ...novasPublicacoes]);
                paginaRef.current = paginaRef.current + 1;
            } else {
                console.error('Erro ao buscar as publicações: Status da resposta:', response.status);
            }
        } catch (error) {
            console.error('Erro ao buscar as publicações:', error);
        } finally {
            carregandoRef.current = false;
        }
    };

    const fetchAndSetCategoria = async () => {
        if (carregandoRef.current) {
            return;
        }

        try {
            carregandoRef.current = true;

            let response = await axios.get(`http://localhost:8080/categoria?idCategoria=${idCategoria}`);
            if (response.status === 200) {
                const categoriaRecebida = response.data;
                setCategoria(categoriaRecebida.data);
            } else {
                console.error('Erro ao buscar a categoria: Status da resposta:', response.status);
            }
        } catch (error) {
            console.error('Erro ao buscar a categoria:', error);
        } finally {
            carregandoRef.current = false;
        }
    };

    const fetchCategoriasDaPessoa = async () => {
        try {
            const idPessoa = Number(localStorage.getItem('idPessoa'));

            let response = await axios.get(`http://localhost:8080/pessoa-categoria?idPessoa=${idPessoa}`);
            if (response.status === 200) {
                const categoriasDoUsuario = response.data;
                setCategoriasDaPessoa(categoriasDoUsuario);

                const categoriaAtualAssociada = categoriasDoUsuario.some(categoriaUsuario => categoriaUsuario.idCategoria == idCategoria);
                setIsCategoriaAssociada(categoriaAtualAssociada);
            } else {
                console.error('Erro ao buscar as categorias do usuário:', response.status);
            }
        } catch (error) {
            console.error('Erro ao buscar as categorias do usuário:', error);
        }
    };


    const associarCategoriaAPessoa = async () => {
        try {
            const idPessoa = Number(localStorage.getItem('idPessoa'));
            const requestBody = {
                idPessoa: idPessoa,
                idCategoria: idCategoria
            };

            const response = await axios.post('http://localhost:8080/pessoa-categoria/', requestBody);

            if (response.status === 200) {
                fetchCategoriasDaPessoa();
                categoria.countSeguidores += 1;
                console.log('Associação bem-sucedida');
            } else {
                console.error('Erro na associação da categoria:', response.data);
            }
        } catch (error) {
            console.error('Erro na chamada da API:', error);
        }
    };

    const desassociarCategoriaAPessoa = async () => {
        try {
            const idPessoa = Number(localStorage.getItem('idPessoa'));
            const idCategoria = categoria.idCategoria;

            const config = {
                headers: {
                    'idPessoa': idPessoa,
                    'idCategoria': idCategoria
                },
            };

            const response = await axios.delete('http://localhost:8080/pessoa-categoria/', config);

            if (response.status === 200) {
                fetchCategoriasDaPessoa();
                categoria.countSeguidores -= 1;
                console.log('Desassociação bem-sucedida');
            } else {
                console.error('Erro na desassociação da categoria:', response.data);
            }
        } catch (error) {
            console.error('Erro na chamada da API:', error);
        }
    };

    const handleSeguirClick = () => {
        associarCategoriaAPessoa();
    };

    const deixarDeSeguirClick = () => {
        desassociarCategoriaAPessoa();
    };

    //////////////////////////////////////////
    const abrirMenuOpcoes = (publicacaoId) => {
        if (expandedOption === publicacaoId) {
            setExpandedOption(null);
        } else {
            setExpandedOption(publicacaoId);
        }
    };

    const handleCategoriaClick = (categoria) => {
        if (categoria && categoria.idCategoria) {
            navigate(`/TelaCategoria/${categoria.idCategoria}`);
        }
    };

    const expandirConteudo = (publicacaoId) => {
        setExpandedContent((prevExpandedContent) => ({
            ...prevExpandedContent,
            [publicacaoId]: true,
        }));
    };

    const recolherConteudo = (publicacaoId) => {
        setExpandedContent((prevExpandedContent) => ({
            ...prevExpandedContent,
            [publicacaoId]: false,
        }));
    };



    const adicionarComentario = async (publicacaoExterna, idComentarioSuperior, comentarioPublicacao) => {
        const comentarioRespostaPublicacao = comentarios[idComentarioSuperior];
        const pessoaString = localStorage.getItem('pessoa');
        const pessoaParsed = JSON.parse(pessoaString);

        try {
            let conteudoComentario = comentarioPublicacao ? comentarioPublicacao.trim() : comentarioRespostaPublicacao;

            if (conteudoComentario === undefined || conteudoComentario === null || conteudoComentario.trim() === "") {
                toast.error("O conteúdo do comentário não pode ser nulo, verifique.");
                return;
            }

            const novoComentario = {
                idComentario: null,
                pessoa: pessoaParsed,
                idPublicacao: publicacaoExterna.idPublicacao,
                idComentarioResposta: idComentarioSuperior,
                conteudo: conteudoComentario,
                nrDenuncias: 0,
                dtCriacaoComent: null,
                ieAtivo: 1,
                dtInativo: null,
            };

            const response = await axios.post('http://localhost:8080/comentario', novoComentario);

            if (response.status === 200) {
                setComentarios({
                    ...comentarios,
                    [idComentarioSuperior]: '',
                });


                const index = publicacoes.findIndex(
                    (publicacao) => publicacao.idPublicacao === publicacaoExterna.idPublicacao
                );

                if (index !== -1) {
                    publicacoes[index].comentarios = response.data;
                    setPublicacoes([...publicacoes]);

                    console.log('Comentário criado com sucesso:', response.data);
                } else {
                    console.error('Publicação não encontrada na lista.');
                }
            } else {
                console.error('Erro ao criar comentário:', response.data);
            }
        } catch (error) {
            console.error('Erro ao enviar os dados do comentário:', error);
        }
    };

    const truncateText = (text, maxLength) => {
        if (!text) {
            return '';
        }
        if (text.length <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength) + '...';
    };


    const mostrarComentarios = (publicacaoId) => {
        setExpandedComments((prevExpandedComments) => {
            const newExpandedComments = { ...prevExpandedComments };

            Object.keys(newExpandedComments).forEach((key) => {
                newExpandedComments[key] = false;
            });

            newExpandedComments[publicacaoId] = true;

            return newExpandedComments;
        });
    };

    function contarComentarios(comentarios) {
        let count = 0;

        for (const comentario of comentarios) {
            count++;
            if (comentario.respostas && comentario.respostas.length > 0) {
                count += contarComentarios(comentario.respostas);
            }
        }

        return count;
    }

    const adicionarCurtida = async (idPublicacao) => {
        try {
            const idPessoa = Number(localStorage.getItem('idPessoa'));

            const publicacaoEncontrada = publicacoes.find(publicacao => publicacao.idPublicacao === idPublicacao);

            const requestBody = {
                idPublicacao: publicacaoEncontrada.idPublicacao,
                idPessoa: idPessoa
            };

            const response = await axios.post('http://localhost:8080/publicacao-curtida', requestBody);

            if (response.status === 200) {
                publicacaoEncontrada.publicacaoCurtidas = response.data;

                setPublicacoes([...publicacoes]);

                setCurtidasUsuario((prevCurtidas) => {
                    const novaCurtida = new Set(prevCurtidas);
                    if (novaCurtida.has(idPublicacao)) {
                        novaCurtida.delete(idPublicacao);
                    } else {
                        novaCurtida.add(idPublicacao);
                    }
                    return novaCurtida;
                });
            } else {
                console.error('Erro ao curtir/descurtir a publicação:', response.data);
            }
        } catch (error) {
            console.error('Erro ao enviar os dados:', error);
        }
    };

    const getClassForRespostaNivel = (nivel) => {
        return `resposta-nivel-${nivel}`;
    };

    const toggleFormularioComentario = (comentarioId) => {
        setMostrarFormularioComentario((prevState) => {
            return {
                ...prevState,
                [comentarioId]: !prevState[comentarioId],
            };
        });
    };

    const renderRespostas = (respostas, nivel, publicacao) => {
        return (
            <div className={`respostas-resposta-nivel-${nivel}`}>
                {respostas.map((resposta) => (
                    <div key={resposta.idComentario} className="comentario">
                        <div className="comentario-autor">{resposta.pessoa.nomeCompleto}</div>
                        <div className="comentario-conteudo">{resposta.conteudo}</div>
                        <a
                            href="#"
                            className="responder-link"
                            onClick={(e) => {
                                e.preventDefault();
                                toggleFormularioComentario(resposta.idComentario);
                            }}
                            title="Responder"
                        >
                            Responder
                        </a>

                        {mostrarFormularioComentario[resposta.idComentario] && (
                            <div className="comment-input-container">
                                <input
                                    type="text"
                                    placeholder="Responder comentário..."
                                    className="comment-input"
                                    value={comentarios[resposta.idComentario] || ''}
                                    onChange={(e) =>
                                        setComentarios({
                                            ...comentarios,
                                            [resposta.idComentario]: e.target.value,
                                        })
                                    }
                                />
                                <button
                                    onClick={() => adicionarComentario(publicacao, resposta.idComentario)}
                                    className="comment-button"
                                >
                                    Responder
                                </button>
                            </div>
                        )}
                        {renderRespostas(resposta.respostas, nivel + 1, publicacao)}
                    </div>
                ))}
            </div>
        );
    };

    if (categoria === null) {

        return <div id="sentinela" className="loading-text">...</div>;
    }

    return (

        <div className="mural-container" style={{ overflow: 'hidden', overflowY: 'auto' }}>
            <TopMenu />
            <div style={{ height: '35px' }}></div>

            <div className="publicacoes-categoria-container" ref={publicacoesContainerRef}>

                <div className="conteudo-capa">

                    <div className="imagem-capa">
                        <img src={`data:image/jpeg;base64, ${categoria.imgCapa}`} className="capa-imagem" style={{ height: '100px' }} />
                    </div>

                    <div className="imagem-120px-container">
                        <img src={`data: image/jpeg;base64, ${categoria.img}`} className="imagem-120px" />
                        <div className="conteudo-nome-descricao">
                            <h1>{categoria.dsNome}</h1>
                            <p>{categoria.dsDescricao}</p>
                        </div>
                    </div>

                    <div className="botoes-container">
                        <div className="info-container">
                            <button
                                style={{
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    padding: 0,
                                    position: 'relative'
                                }}
                            >
                                <div className="image-background"></div>
                                <img
                                    src={trend}
                                    alt="Curtir"
                                    className="like-image"
                                />
                            </button>
                            <span className="separator">•</span>
                            <span>{categoria.countSeguidores} seguidores</span>
                        </div>

                        <div className="info-container">
                            <button
                                style={{
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    padding: 0,
                                    position: 'relative'
                                }}
                            >
                                <div className="image-background"></div>
                                <img
                                    src={publi}
                                    alt="Curtir"
                                    className="like-image"
                                />
                            </button>
                            <span className="separator">•</span>
                            <span>{categoria.countPublicacoes} postagens</span>
                        </div>

                        <div className="button-container">
                            <button
                                style={{
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    padding: 0,
                                    position: 'relative'
                                }}
                            >
                                <div className="image-background"></div>
                                <img
                                    src={ellipsis}
                                    alt="Curtir"
                                    className="like-image"
                                />
                            </button>

                            {isCategoriaAssociada ? (
                                <button className="botao-retangular" onClick={deixarDeSeguirClick}>
                                    Deixar de Seguir
                                </button>
                            ) : (
                                <button className="botao-retangular" onClick={handleSeguirClick}>
                                    Seguir
                                </button>
                            )}

                        </div>
                    </div>
                </div>

                <div className="espaco-publicacoes" style={{ margin: '10px' }}>
                </div>

                {publicacoes.map((publicacao, index) => (
                    <div key={`${publicacao.idPublicacao}-${index}`} className="publicacao">

                        {/* Conteúdo da Publicação */}
                        <div className="publicacao-conteudo">
                            <div className="publicacao-options-button" onClick={() => abrirMenuOpcoes(publicacao.idPublicacao)}>
                                <div className="image-background"></div>
                                <img
                                    src={ellipsis}
                                    alt="Curtir"
                                    className="like-image"
                                />
                                {expandedOption === publicacao.idPublicacao && (
                                    <div className="menu-opcoes">
                                        <div onClick={() => console.log('Opção 1')}>Salvar publicação</div>
                                        <div onClick={() => console.log('Opção 2')}>Denunciar</div>
                                    </div>
                                )}
                            </div>
                            <div className="publicacao-header">
                                <div className="publicacao-autor">{publicacao.pessoa.nomeCompleto}</div>
                                <div className="publicacao-info-container">
                                    <h2 className="publicacao-titulo">{publicacao.titulo}</h2>
                                    <span className="separator"></span>
                                    {publicacao.categoria && (
                                        <div className="publicacao-categoria" onClick={() => handleCategoriaClick(publicacao.categoria)} style={{ cursor: 'pointer' }}>
                                            <div className="categoria-tag">{publicacao.categoria.dsNome}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="texto">
                                {publicacao.conteudo && (
                                    <>
                                        {expandedContent[publicacao.idPublicacao] ? (
                                            publicacao.conteudo
                                        ) : (
                                            truncateText(publicacao.conteudo, 300)
                                        )}
                                        {publicacao.conteudo.length > 600 && (
                                            <a
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    expandedContent[publicacao.idPublicacao]
                                                        ? recolherConteudo(publicacao.idPublicacao)
                                                        : expandirConteudo(publicacao.idPublicacao);
                                                }}
                                                className="ver-mais-button"
                                            >
                                                {expandedContent[publicacao.idPublicacao] ? 'Ver menos' : 'Ver mais'}
                                            </a>
                                        )}
                                    </>
                                )}
                            </div>
                            {publicacao.img && (
                                <img src={`data:image/jpeg;base64,${publicacao.img}`} alt="Imagem da publicação" className="publicacao-imagem" />
                            )}
                        </div>

                        {/* Comentários da Publicação */}
                        <div className="publicacao-comentarios">
                            {expandedComments[publicacao.idPublicacao] && (
                                <div className="comentarios-info">

                                    {/* Comentário DIRETO NA PUBLICAÇÃO */}
                                    <div className="comment-input-container">
                                        <input
                                            type="text"
                                            placeholder="Adicione um comentário..."
                                            className="comment-input"
                                        />
                                        <button
                                            onClick={() => {
                                                const comentarioInput = document.querySelector('.comment-input');
                                                const comentario = comentarioInput.value;
                                                adicionarComentario(publicacao, null, comentario);

                                                comentarioInput.value = '';
                                            }}
                                            className="comment-button"
                                        >
                                            Adicionar Comentário
                                        </button>
                                    </div>


                                    {publicacao.comentarios.map((comentario) => (
                                        <div key={comentario.idComentario} className={`comentario ${getClassForRespostaNivel(comentario.nivel)}`}>
                                            <div className="comentario-autor">{comentario.pessoa.nomeCompleto}</div>

                                            <div className="comentario-conteudo">{comentario.conteudo}</div>
                                            <a
                                                href="#"
                                                className="responder-link"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    toggleFormularioComentario(comentario.idComentario);
                                                }}
                                                title="Responder"
                                            >
                                                Responder
                                            </a>

                                            {mostrarFormularioComentario[comentario.idComentario] && (
                                                <div className="comment-input-container">
                                                    <input
                                                        type="text"
                                                        placeholder="Responder comentário..."
                                                        className="comment-input"
                                                        value={comentarios[comentario.idComentario] || ''}
                                                        onChange={(e) =>
                                                            setComentarios({
                                                                ...comentarios,
                                                                [comentario.idComentario]: e.target.value,
                                                            })
                                                        }
                                                    />
                                                    <button
                                                        onClick={() => adicionarComentario(publicacao, comentario.idComentario)}
                                                        className="comment-button"
                                                    >
                                                        Responder
                                                    </button>
                                                </div>
                                            )}

                                            {/* Comentário RESPOSTA ALÉM DO NIVEL 1 */}
                                            {renderRespostas(comentario.respostas, comentario.nivel, publicacao)}
                                            <hr />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Curtidas e Botões de Ação */}
                        <div className="publicacao-info">
                            <div className="botoes-container">
                                <button
                                    onClick={() => adicionarCurtida(publicacao.idPublicacao)}
                                    style={{ backgroundColor: 'transparent', border: 'none', padding: 0, position: 'relative' }}
                                >
                                    <div className="image-background"></div>
                                    <img
                                        src={curtidasUsuario.has(publicacao.idPublicacao) ? likedImage : likeImage}
                                        alt="Curtir"
                                        className="like-image"
                                    />
                                </button>
                                <span className="separator">•</span>
                                <span>{publicacao.publicacaoCurtidas.length} curtidas</span>

                                <button
                                    onClick={() => mostrarComentarios(publicacao.idPublicacao)}
                                    style={{ backgroundColor: 'transparent', border: 'none', padding: 0, position: 'relative' }}
                                >
                                    <div className="image-background"></div>
                                    <img
                                        src={comentarioImage}
                                        alt="Comentar"
                                        className="like-image"
                                    />

                                </button>
                                <span className="separator">•</span>
                                <span>{contarComentarios(publicacao.comentarios)} comentários</span>
                            </div>
                        </div>
                    </div>
                ))}
                <li id="sentinela"></li>
            </div>
            <ToastContainer />
        </div >
    );
};

export default TelaCategoria;
