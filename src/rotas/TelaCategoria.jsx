import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import './TemaPadrao.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TopMenu from './TopMenu';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import likeImage from '../assets/like.png';
import trend from '../assets/trend.png';
import ellipsis from '../assets/ellipsis.png';
import publi from '../assets/write.png';

const TelaCategoria = () => {
    const { idCategoria } = useParams();
    const carregandoRef = useRef(false);
    const [categoria, setCategoria] = useState(null);
    const [categoriasDaPessoa, setCategoriasDaPessoa] = useState([]);
    const [isCategoriaAssociada, setIsCategoriaAssociada] = useState(false);


    useEffect(() => {
        fetchAndSetCategoria();
        fetchCategoriasDaPessoa();
    }, []);

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

    if (categoria === null) {
        return <div>Carregando...</div>;
    }

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

    return (
        <div className="conteudo-centralizado-categoria">
            <TopMenu />
            <div className="container-centralizador-categoria">
                <div className="conteudo-categoria">
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
                </div>
            </div>
        </div>
    );


};

export default TelaCategoria;
