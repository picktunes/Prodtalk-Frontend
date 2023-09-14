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
    const [file, setFile] = useState(null);
    const publicacoesContainerRef = useRef(null);


    useEffect(() => {
        const fetchPublicacoes = async () => {
            try {
                setCarregando(true);
                const response = await axios.get(`http://localhost:8080/publicacoes?page=${pagina}`);
                const novasPublicacoes = response.data;
                setPublicacoes((prevPublicacoes) => {
                    const novasPublicacoesFiltradas = novasPublicacoes.filter(
                        (publicacao) => !prevPublicacoes.some((prevPublicacao) => prevPublicacao.idPublicacao === publicacao.idPublicacao)
                    );
                    return [...prevPublicacoes, ...novasPublicacoesFiltradas];
                });

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

    const handleSubmit = (event) => {
        event.preventDefault();
        postar();
    };

    const postar = async () => {
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

        setPublicacoes((prevPublicacoes) => [novaPublicacao, ...prevPublicacoes]);

        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async function () {
                const base64 = reader.result.split(',')[1];

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
                } catch (error) {
                    console.error("Erro ao enviar os dados:", error);
                }
            };
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

    const adicionarComentario = (publicacaoId) => {

    };

    const handleImageChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
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

                        <p>
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

                        </p>

                        {publicacao.img && <img src={`data:image/jpeg;base64,${publicacao.img}`} alt="Imagem da publicação" className="publicacao-imagem" />}

                        < div className="publicacao-info" >
                            <span>{publicacao.quantidadeLikes} likes</span>
                            <button onClick={() => adicionarComentario(publicacao.idPublicacao)}>Comentários</button>
                        </div>
                    </div>
                ))
                }
                {carregando && <h4>Carregando...</h4>}
                {
                    publicacoes.length > pagina * 4 && (
                        <button onClick={carregarMaisPublicacoes} disabled={carregando}>
                            Carregar Mais
                        </button>
                    )
                }
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
                                {/* Adicionado campo para fazer upload de imagem */}
                                <div className="form-group">
                                    <label htmlFor="imagem">Imagem: </label>
                                    <input type="file" id="imagem" accept="image/*" onChange={handleImageChange} />
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