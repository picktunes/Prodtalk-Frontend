import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import TopMenu from './TopMenu';
import likeImage from '../assets/like.png';
import likedImage from '../assets/liked.png';
import comentarioImage from '../assets/comentario.png';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MuralDePublicacoes = () => {
    const [publicacoes, setPublicacoes] = useState([]);
    const [exibirPopup, setExibirPopup] = useState(false);
    const [comentario, setComentario] = useState('');
    const [expandedContent, setExpandedContent] = useState({});
    const [expandedOption, setExpandedOption] = useState(null);
    const [file, setFile] = useState(null);
    const publicacoesContainerRef = useRef(null);
    const paginaRef = useRef(1);
    const carregandoRef = useRef(false);
    const [curtidasUsuario, setCurtidasUsuario] = useState(new Set());
    const [comentarios, setComentarios] = useState({});
    const [expandedComments, setExpandedComments] = useState({});
    const [mostrarFormularioComentario, setMostrarFormularioComentario] = useState(false);
    const textoDeBuscaRef = useRef('');

    const handleSearchSubmit = (searchText) => {
        if (searchText !== textoDeBuscaRef.current) {
            setPublicacoes([]);
            paginaRef.current = 1;
            textoDeBuscaRef.current = searchText;
            carregarMaisPublicacoes();
        }
    };

    useEffect(() => {
        console.log("Componente montado / Atualizado!");
        const intersectionObserver = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    console.log('Sentinela appears!');
                    carregarMaisPublicacoes();
                }
            }
        );

        intersectionObserver.observe(document.getElementById('sentinela'));
        return () => {
            intersectionObserver.disconnect();
        };
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

            if (textoDeBuscaRef.current) {
                // Se textoDeBusca não estiver vazio, faça a solicitação com a busca
                response = await axios.get(`http://localhost:8080/publicacoes/buscar-publicacoes?page=${paginaRef.current}&texto=${textoDeBuscaRef.current}`);
            } else {
                // Caso contrário, faça a solicitação padrão
                response = await axios.get(`http://localhost:8080/publicacoes?page=${paginaRef.current}`);
            }

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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (expandedOption && !event.target.closest('.menu-opcoes') && !event.target.closest('.publicacao-options-button')) {
                setExpandedOption(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [expandedOption]);

    const truncateText = (text, maxLength) => {
        if (!text) {
            return '';
        }
        if (text.length <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength) + '...';
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

    const abrirMenuOpcoes = (publicacaoId) => {
        if (expandedOption === publicacaoId) {
            setExpandedOption(null);
        } else {
            setExpandedOption(publicacaoId);
        }
    };

    const fecharMenuOpcoes = (publicacaoId) => {
        setExpandedOptions((prevExpandedOptions) => ({
            ...prevExpandedOptions,
            [publicacaoId]: false,
        }));
    };

    const abrirPopup = () => {
        setExibirPopup(true);
        document.body.classList.add('popup-open');
    };

    const fecharPopup = () => {
        setExibirPopup(false);
        document.body.classList.remove('popup-open');
    };

    const handleSubmit = (event) => {
        console.log("Formulário submetido");
        event.preventDefault();
        postar();
    };

    const postar = async () => {
        console.log("postar chamada");
        const tituloElement = document.getElementById('titulo');
        const conteudoElement = document.getElementById('conteudo');
        const tituloValue = tituloElement ? tituloElement.value : "";
        const conteudoValue = conteudoElement ? conteudoElement.value : "";

        const novaPublicacao = {
            id: publicacoes.length + 1,
            titulo: tituloValue,
            conteudo: conteudoValue,
            quantidadeLikes: 0
        };

        let base64 = null;
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            await new Promise((resolve) => {
                reader.onload = function () {
                    base64 = reader.result.split(',')[1];
                    resolve();
                };
            });
        }

        try {
            await axios.post('http://localhost:8080/publicacoes', {
                idPublicacao: null,
                idPessoa: null,
                dataCriacao: null,
                dataAtualizacao: null,
                conteudo: conteudoValue,
                titulo: tituloValue,
                quantidadeLikes: 0,
                img: base64
            });

            console.log("Dados enviados com sucesso!");

            if (file) {
                setFile(null);
            }

            fecharPopup();
            setPublicacoes([]);
            paginaRef.current = 1;
            await carregarMaisPublicacoes();
        } catch (error) {
            console.error("Erro ao enviar os dados:", error);
        }
    };

    const handleImageChange = (event) => {
        const input = event.target;
        const selectedFile = input.files[0];
        if (selectedFile) {
            const fileType = selectedFile.type;
            const validImageTypes = ['image/jpeg', 'image/png'];
            if (!validImageTypes.includes(fileType)) {
                alert('Por favor, carregue um arquivo PNG ou JPG!');
                input.value = '';
                return;
            }
            setFile(selectedFile);
        }
    };

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

    const getClassForRespostaNivel = (nivel) => {
        return `resposta-nivel-${nivel}`;
    };

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

    const handleComentarioChange = (event) => {
        setComentario(event.target.value);
    }

    return (
        <div className="mural-container" style={{ overflow: 'hidden', overflowY: 'auto' }}>
            <TopMenu onSearchSubmit={handleSearchSubmit} searchText={textoDeBuscaRef.current} />
            <h1></h1>
            <div className="input-container" onClick={abrirPopup}>
                <div className="input-content">
                    <div className="texto-opaco">O que você gostaria de perguntar ou compartilhar?</div>
                </div>
            </div>

            <div className="espaco-publicacoes"></div>
            <div className="publicacoes-container" ref={publicacoesContainerRef}>
                {publicacoes.map((publicacao, index) => (
                    <div key={`${publicacao.idPublicacao}-${index}`} className="publicacao">

                        {/* Conteúdo da Publicação */}
                        <div className="publicacao-conteudo">
                            <div className="publicacao-options-button" onClick={() => abrirMenuOpcoes(publicacao.idPublicacao)}>
                                <span>...</span>
                                {expandedOption === publicacao.idPublicacao && (
                                    <div className="menu-opcoes">
                                        <div onClick={() => console.log('Opção 1')}>Salvar publicação</div>
                                        <div onClick={() => console.log('Opção 2')}>Denunciar</div>
                                    </div>
                                )}
                            </div>
                            <div className="publicacao-header">
                                <div className="publicacao-autor">{publicacao.pessoa.nomeCompleto}</div>
                                <h2 className="publicacao-titulo">{publicacao.titulo}</h2>
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
                {carregandoRef.current ? <h4>Carregando...</h4> : null}
                <li id="sentinela"></li>
            </div>

            {
                exibirPopup && (
                    <div className="popup-overlay">
                        <div className="popup-container">
                            <div className="popup">
                                <button className="popup-close-button" onClick={fecharPopup}>
                                    X
                                </button>
                                <h3>Adicionar Publicação</h3>
                                <form onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label htmlFor="titulo">Título</label>
                                        <input type="text" id="titulo" />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="conteudo">Conteúdo</label>
                                        <textarea id="conteudo"></textarea>
                                    </div>
                                    <div className="form-group">
                                        <label>
                                            <input type="radio" name="tipo" value="pergunta" /> Pergunta
                                        </label>
                                        <label>
                                            <input type="radio" name="tipo" value="feedback" /> Feedback
                                        </label>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="imagem">Imagem(pgn ou jpg): </label>
                                        <input type="file" id="imagem" accept="image/png, image/jpeg" onChange={handleImageChange} />
                                    </div>
                                    <div className="form-group button-group">
                                        <button type="submit" className="confirmar-button">
                                            Confirmar
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }
            <ToastContainer />
        </div >
    );
};

export default MuralDePublicacoes;
