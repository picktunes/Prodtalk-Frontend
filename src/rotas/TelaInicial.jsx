import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import TopMenu from './TopMenu';
import likeImage from '../assets/like.png';
import likedImage from '../assets/liked.png';


const MuralDePublicacoes = () => {
    const [publicacoes, setPublicacoes] = useState([]);
    const [pagina, setPagina] = useState(1);
    const [exibirPopup, setExibirPopup] = useState(false);
    const [expandedContent, setExpandedContent] = useState({});
    const [expandedOption, setExpandedOption] = useState(null);
    const [file, setFile] = useState(null);
    const publicacoesContainerRef = useRef(null);
    const paginaRef = useRef(1);
    const carregandoRef = useRef(false);
    const [curtidasUsuario, setCurtidasUsuario] = useState(new Set());


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

    const carregarMaisPublicacoes = () => {
        console.log("carregarMaisPublicacoes chamada");
        fetchPublicacoes();
    };

    const fetchPublicacoes = async () => {
        console.log("fetchPublicacoes chamada");
        if (carregandoRef.current) {
            return;
        }

        try {
            carregandoRef.current = true;

            const response = await axios.get(`http://localhost:8080/publicacoes?page=${paginaRef.current}`);

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

        //setPublicacoes((prevPublicacoes) => [novaPublicacao, ...prevPublicacoes]);

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
            fetchPublicacoes();
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
            console.log("adicionarCurtida chamada", idPublicacao);
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


    return (
        <div className="mural-container" style={{ overflow: 'hidden', overflowY: 'auto' }}>
            <TopMenu />
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
                        <div className="publicacao-options-button" onClick={() => abrirMenuOpcoes(publicacao.idPublicacao)}>
                            <span>...</span>
                            {expandedOption === publicacao.idPublicacao && (
                                <div className="menu-opcoes">
                                    <div onClick={() => console.log('Opção 1')}>
                                        Salvar publicação
                                    </div>
                                    <div onClick={() => console.log('Opção 2')}>
                                        Denunciar
                                    </div>
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

                        {publicacao.img && <img src={`data:image/jpeg;base64,${publicacao.img}`} alt="Imagem da publicação" className="publicacao-imagem" />}

                        <div className="publicacao-info">

                            <div className="curtidas-container">
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
                            </div>

                            <button onClick={() => adicionarComentario(publicacao.idPublicacao)}>Comentários</button>
                        </div>
                    </div>
                ))
                }
                {<h4>Carregando...</h4>}
                <li id="sentinela"></li>
            </div >


            {exibirPopup && (
                <div className="popup-overlay">
                    <div className="popup-container">
                        <div className="popup">
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
                                    <button type="button" onClick={fecharPopup} className="voltar-button">
                                        Voltar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default MuralDePublicacoes;