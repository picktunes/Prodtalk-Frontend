import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import TopMenu from './TopMenu';

const MuralDePublicacoes = () => {
    const [publicacoes, setPublicacoes] = useState([]);
    const [pagina, setPagina] = useState(1);
    const [carregando, setCarregando] = useState(false);
    const [exibirPopup, setExibirPopup] = useState(false);
    const [expandedContent, setExpandedContent] = useState({});
    const [expandedOption, setExpandedOption] = useState(null);
    const publicacoesContainerRef = useRef(null);


    useEffect(() => {
        const fetchPublicacoes = async () => {
            try {
                setCarregando(true);
                const response = await axios.get(`http://localhost:8080/publicacoes?page=${pagina}`);
                const novasPublicacoes = response.data;

                const paginas = Math.ceil(novasPublicacoes.length / 4);
                const paginaAtual = publicacoes.length / 4 + 1;

                if (paginaAtual <= paginas) {
                    setPublicacoes((prevPublicacoes) => {
                        const novasPublicacoesFiltradas = novasPublicacoes.filter(
                            (publicacao) => !prevPublicacoes.some((prevPublicacao) => prevPublicacao.id === publicacao.idPublicacao)
                        );
                        return [...prevPublicacoes, ...novasPublicacoesFiltradas];
                    });
                }
            } catch (error) {
                console.error('Erro ao buscar as publicações:', error);
            } finally {
                setCarregando(false);
            }
        };

        fetchPublicacoes();
    }, [pagina]);

    useEffect(() => {
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

    const carregarMaisPublicacoes = () => {
        if (!carregando) {
            setPagina((prevPagina) => prevPagina + 1);
        }
    };

    const truncateText = (text, maxLength) => {
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

    const postar = () => {
        const titulo = document.getElementById('titulo').value;
        const conteudo = document.getElementById('conteudo').value;

        const novaPublicacao = {
            id: publicacoes.length + 1,
            titulo,
            conteudo,
            quantidadeLikes: 0
        };

        setPublicacoes((prevPublicacoes) => [novaPublicacao, ...prevPublicacoes]);

        fecharPopup();
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        postar();
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

    const adicionarComentario = (publicacaoId) => {

    };

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
                        </div>
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
                        <div className="publicacao-header">
                            <p>{publicacao.titulo}</p>
                        </div>
                        <p>
                            {expandedContent[publicacao.idPublicacao] ? (
                                publicacao.conteudo
                            ) : (
                                truncateText(publicacao.conteudo, 800)
                            )}
                        </p>
                        {publicacao.conteudo.length > 400 && (
                            <button
                                onClick={() =>
                                    expandedContent[publicacao.idPublicacao]
                                        ? recolherConteudo(publicacao.idPublicacao)
                                        : expandirConteudo(publicacao.idPublicacao)
                                }
                                className="ver-mais-button"
                            >
                                {expandedContent[publicacao.idPublicacao] ? 'Ver menos' : 'Ver mais'}
                            </button>
                        )}
                        <div className="publicacao-info">
                            <span>{publicacao.quantidadeLikes} likes</span>
                            <button onClick={() => adicionarComentario(publicacao.idPublicacao)}>Comentários</button>
                        </div>
                    </div>
                ))}
                {carregando && <h4>Carregando...</h4>}
                {publicacoes.length > pagina * 4 && (
                    <button onClick={carregarMaisPublicacoes} disabled={carregando}>
                        Carregar Mais
                    </button>
                )}
                <li id="sentinela"></li>
            </div>

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
        </div>
    );
};

export default MuralDePublicacoes;