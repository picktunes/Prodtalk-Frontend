import TelaCategoria from './TelaCategoria';
import React, { useState, useEffect, useRef } from 'react';
import './TemaPadrao.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TopMenu from './TopMenu';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

const TelaCategorias = () => {
    const navigate = useNavigate();
    const [categorias, setCategorias] = useState([]);
    const [descubraCategorias, setDescubraCategorias] = useState([]);
    const carregandoRef = useRef(false);
    const [mostrarMais, setMostrarMais] = useState(false);
    const [quantidadeExibida, setQuantidadeExibida] = useState(5);
    const [file, setFile] = useState(null);
    const [fileCapa, setFileCapa] = useState(null);

    const [modalAberto, setModalAberto] = useState(false);
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');

    useEffect(() => {
        fetchAndSetCategorias().then(() => {
            fetchAndSetDescobrirCategorias();
        });
    }, []);

    const fetchAndSetCategorias = async () => {
        if (carregandoRef.current) {
            return;
        }

        try {
            carregandoRef.current = true;

            let response = await axios.get(`http://localhost:8080/pessoa-categoria?idPessoa=${Number(localStorage.getItem('idPessoa'))}`);
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

    const fetchAndSetDescobrirCategorias = async () => {
        if (carregandoRef.current) {
            return;
        }

        try {
            carregandoRef.current = true;

            let response = await axios.get(`http://localhost:8080/categoria/categorias`);
            if (response.status === 200) {
                const descubraCategorias = response.data.data;
                setDescubraCategorias((prevDescubraCategorias) => [...prevDescubraCategorias, ...descubraCategorias]);
            } else {
                console.error('Erro ao buscar as categorias: Status da resposta:', response.status);
            }
        } catch (error) {
            console.error('Erro ao buscar as categorias:', error);
        } finally {
            carregandoRef.current = false;
        }
    };

    const handleMostrarMais = () => {
        setQuantidadeExibida(quantidadeExibida + 2);
    };

    const abrirModal = () => {
        setModalAberto(true);
    };

    const fecharModal = () => {
        setModalAberto(false);
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

    const handleImageCapaChange = (event) => {
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
            setFileCapa(selectedFile);
        }
    };

    const criarCategoria = async (e) => {
        e.preventDefault();

        if (nome.length <= 40 && descricao.length <= 80) {
            let imagemBase64 = null;
            let imagemCapaBase64 = null;

            if (file) {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                await new Promise((resolve) => {
                    reader.onload = function () {
                        imagemBase64 = reader.result.split(',')[1];
                        resolve();
                    };
                });
            }

            if (fileCapa) {
                const reader = new FileReader();
                reader.readAsDataURL(fileCapa);
                await new Promise((resolve) => {
                    reader.onload = function () {
                        imagemCapaBase64 = reader.result.split(',')[1];
                        resolve();
                    };
                });
            }

            const categoria = {
                idCategoria: null,
                dsNome: nome,
                dsDescricao: descricao,
                img: imagemBase64,
                imgCapa: imagemCapaBase64,
                dtCriacao: null,
                dtAtualizacao: null,
                ieStatus: null,
                idCategoriaPai: null,
                idPessoaAutor: null,
                contadorVisualizacoes: null,
            };

            try {
                await axios.post('http://localhost:8080/categoria', categoria);

                console.log('Dados enviados com sucesso!');

                setNome('');
                setDescricao('');
                setFile(null);
                setFileCapa(null);

                fecharModal();
            } catch (error) {
                console.error('Erro ao enviar os dados:', error);
            }
        } else {
            console.log('Limite de caracteres excedido.');
        }
    };

    const handleCategoriaClick = (categoria) => {
        if (categoria && categoria.idCategoria) {
            navigate(`/TelaCategoria/${categoria.idCategoria}`);

        }
    };

    return (
        <div className="conteudo-centralizado-categorias">
            <TopMenu />
            <div className="container-centralizador-categorias">
                <div className="conteudo-categorias">

                    <div className="container-centralizador-texto">
                        <button
                            onClick={abrirModal}
                            className="botao-hover"
                        >
                            Criar categoria
                        </button>
                    </div>

                    <div className="container-centralizador-texto">
                        <h2>Suas categorias</h2>
                    </div>

                    <div className="categoria-list">
                        <ul>
                            {categorias.slice(0, quantidadeExibida).map((categoria, index) => (
                                <div className="categoria-info" key={categoria.idCategoria}>
                                    <li className="categoria-item" onClick={() => handleCategoriaClick(categoria)}>
                                        <div className="imagem-capa">
                                            <img src={`data: image / jpeg; base64, ${categoria.img} `} className="imagem-30px" />
                                        </div>
                                        <h3>{categoria.dsNome}</h3>
                                    </li>
                                </div>
                            ))}
                        </ul>
                    </div>

                    <div className="container-centralizador-texto">
                        <button
                            onClick={handleMostrarMais}
                            className="ver-mais-button"
                            style={{ display: categorias.length > quantidadeExibida ? 'block' : 'none' }}
                        >
                            Ver mais
                        </button>
                    </div>
                </div>
                <div></div>

                <div className="conteudo-descobrir-categorias" >
                    <div className="container-centralizador-texto">
                        <h2>Descubra novas categorias</h2>
                    </div>
                    <div className="novas-categorias-container">
                        {
                            descubraCategorias.slice(0, 50).map((categoriaNova, index) => (
                                <div key={categoriaNova.idCategoria} className="categoria-card" onClick={() => handleCategoriaClick(categoriaNova)}>
                                    <div className="imagem-capa">
                                        <img src={`data: image / jpeg; base64, ${categoriaNova.imgCapa} `} className="capa-imagem" style={{ height: '100px' }} />

                                    </div>
                                    <div className="imagem-capa">
                                        <img src={`data: image / jpeg; base64, ${categoriaNova.img} `} className="imagem-60px" />
                                    </div>
                                    <h3>{categoriaNova.dsNome}</h3>
                                    <p>{categoriaNova.dsDescricao}</p>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>

            {
                modalAberto && (
                    <div className="popup-overlay">
                        <div className="popup-container">
                            <div className="popup">
                                <button className="popup-close-button" onClick={fecharModal}>
                                    X
                                </button>
                                <h3>Criar um espaço</h3>
                                <form onSubmit={criarCategoria}>
                                    <div className="form-group">
                                        <label htmlFor="nome">Nome* ({40 - nome.length} caracteres restantes)</label>
                                        <input
                                            type="text"
                                            id="nome"
                                            value={nome}
                                            onChange={(e) => {
                                                if (e.target.value.length <= 40) {
                                                    setNome(e.target.value);
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="descricao">Breve descrição ({80 - descricao.length} caracteres restantes)</label>
                                        <textarea
                                            id="descricao"
                                            value={descricao}
                                            onChange={(e) => {
                                                if (e.target.value.length <= 80) {
                                                    setDescricao(e.target.value);
                                                }
                                            }}
                                        ></textarea>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="imagem">Imagem(pgn ou jpg): </label>
                                        <input type="file" id="imagem" accept="image/png, image/jpeg" onChange={handleImageChange} />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="imagem">Imagem capa(pgn ou jpg): </label>
                                        <input type="file" id="imagem" accept="image/png, image/jpeg" onChange={handleImageCapaChange} />
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

export default TelaCategorias
