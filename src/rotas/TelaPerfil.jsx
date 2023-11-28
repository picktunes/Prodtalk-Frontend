import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import './TemaPadrao.css';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TopMenu from './TopMenu';
import DatePicker from 'react-datepicker';
import likeImage from '../assets/like.png';
import likedImage from '../assets/liked.png';
import trend from '../assets/trend.png';
import ellipsis from '../assets/ellipsis.png';
import publi from '../assets/write.png';
import comentarioImage from '../assets/comentario.png';
import emptyImage from '../assets/emptyImg.png';
import { useNavigate } from 'react-router-dom';

const TelaPerfil = () => {
    const { idPessoa } = useParams();
    const navigate = useNavigate();
    const carregandoRef = useRef(false);
    const [pessoa, setPessoa] = useState('');
    const [publicacoesPessoa, setPublicacoesPessoa] = useState([]);
    const [categorias, setCategorias] = useState([]);

    useEffect(() => {
        getPerfilPessoa()
            .then(() => fetchAndSetCategorias())
            .then(() => fetchPublicacoesPessoa())
            .catch(error => {
                console.error(error);
            });
    }, []);

    const getPerfilPessoa = () => {
        return axios.get('http://localhost:8080/pessoaId', {
            params: {
                idPessoa: idPessoa
            }
        })
            .then(response => {
                const pessoaData = response.data;
                setPessoa(pessoaData);
            });
    };

    const fetchAndSetCategorias = async () => {
        if (carregandoRef.current) {
            return;
        }

        try {
            carregandoRef.current = true;

            let response = await axios.get(`http://localhost:8080/pessoa-categoria?idPessoa=${idPessoa}`);
            if (response.status === 200) {
                const novasCategorias = response.data;
                setCategorias((prevCategorias) => [...prevCategorias, ...novasCategorias]);
            } else {
                console.error('Erro ao buscar as categorias: Status da resposta:', response.status);
            }
        } catch (error) {
            console.error('Erro ao buscar as categorias:', error);
        } finally {
            carregandoRef.current = false;
        }
    };

    const fetchPublicacoesPessoa = async () => {
        if (carregandoRef.current) {
            return;
        }

        try {
            carregandoRef.current = true;
            const response = await axios.get(`http://localhost:8080/publicacoes/buscar-publicacoes-pessoa?&idPessoa=${idPessoa}`);

            if (response.status === 200) {
                const novasPublicacoes = response.data;
                setPublicacoesPessoa((prevPublicacoes) => [...prevPublicacoes, ...novasPublicacoes]);
            } else {
                console.error('Erro ao buscar as publicações: Status da resposta:', response.status);
            }
        } catch (error) {
            console.error('Erro ao buscar as publicações:', error);
        } finally {
            carregandoRef.current = false;
        }
    };

    const handleCategoriaClick = (categoria) => {
        if (categoria && categoria.idCategoria) {
            navigate(`/TelaCategoria/${categoria.idCategoria}`);

        }
    };

    const handlePublicacaoClick = (publicacao) => {
        if (publicacao && publicacao.idPublicacao) {
            navigate(`/TelaPublicacao/${publicacao.idPublicacao}`);
        }
    };

    if (!pessoa || !pessoa.data) {
        return (<div className="conteudo-centralizado">
            <div className="container-centralizador">
                <div id="sentinela" className="loading-text">...</div>
            </div>
        </div>)
    }

    return (

        <div className="conteudo-centralizado">
            <div className="container-centralizador">
                <h1></h1>
                <div className="dados-perfil">
                    <div className="imagem-120px-container">
                        <img
                            src={`data:image/jpeg;base64, ${pessoa.data.fotoPerfil}`}
                            className="foto-perfil-grande"
                        />
                        <div className="conteudo-nome-descricao">
                            <h1>{pessoa.data.nomeCompleto}</h1>
                            <p>{pessoa.data.biografia}</p>
                        </div>
                    </div>

                    <div className="comentarios-info"></div>

                    <div className="conteudo-nome-descricao">
                        <p>Postagens</p>
                        {publicacoesPessoa.map(publicacao => (
                            <div key={publicacao.id}>
                                <li className="perfil-publicacao-item" onClick={() => handlePublicacaoClick(publicacao)}>
                                    <span className="separator"></span>
                                    <div className="imagem-capa">
                                        <img
                                            src={publicacao.img ? `data:image/jpeg;base64, ${publicacao.img}` : emptyImage}
                                            className="imagem-30px"
                                        />
                                    </div>
                                    <span className="separator"></span>
                                    <h4>{publicacao.titulo}</h4>
                                </li>
                            </div>
                        ))}
                    </div>
                </div>

                <ul>
                    <div>Categorias</div>
                    <div className="linha"></div>
                    {categorias.slice(0, 200).map((categoria, index) => (
                        <div className="categoria-list">
                            <div className="categoria-info" key={categoria.idCategoria}>
                                <li className="categoria-item" onClick={() => handleCategoriaClick(categoria)}>
                                    <div className="imagem-capa">
                                        <img
                                            src={categoria.img ? `data:image/jpeg;base64, ${categoria.img}` : emptyImage}
                                            className="imagem-30px"
                                        />
                                    </div>
                                    <h3>{categoria.dsNome}</h3>
                                </li>
                            </div>
                        </div>
                    ))}
                </ul>

            </div>
        </div>
    );
};

export default TelaPerfil;
