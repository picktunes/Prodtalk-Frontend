import React, { useState, useEffect } from 'react';
import './TemaPadrao.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TopMenu from './TopMenu';

const TelaDadosPessoa = () => {
    const [nomeCompleto, setNomeCompleto] = useState('');
    const [idade, setIdade] = useState('');
    const [sexo, setSexo] = useState('masculino');
    const [interesses, setInteresses] = useState('');
    const [profissao, setProfissao] = useState('');
    const [biografia, setBiografia] = useState('');
    const [activeTab, setActiveTab] = useState(0);

    const navigate = useNavigate();

    useEffect(() => {
        setNomeCompleto(localStorage.getItem('nomeCompleto'));
        setIdade(localStorage.getItem('idade'));
        setInteresses(localStorage.getItem('interesses'));
        setProfissao(localStorage.getItem('profissao'));
        setBiografia(localStorage.getItem('biografia'));
    }, []);

    const handleNomeCompletoChange = (event) => {
        setNomeCompleto(event.target.value);
    };

    const handleIdadeChange = (event) => {
        setIdade(event.target.value);
    };

    const handleSexoChange = (event) => {
        setSexo(event.target.value);
    };

    const handleInteressesChange = (event) => {
        setInteresses(event.target.value);
    };

    const handleProfissaoChange = (event) => {
        setProfissao(event.target.value);
    };

    const handleBiografiaChange = (event) => {
        setBiografia(event.target.value);
    };

    const handleSalvar = (e) => {
        e.preventDefault();

        axios.post('http://localhost:8080/pessoa', {
        }).then(response => {
            navigate('/TelaInicial');
        }).catch(error => {
            toast.error(error.response.data);
        });
    };

    const Container1 = () => (
        <div className="login-content">
            <h1 className="login-heading">Pessoa</h1>
            <form onSubmit={handleSalvar} className="login-form">
                <div className="form-group">
                    <label htmlFor="nomeCompleto" className="form-label">Nome completo:</label>
                    <input
                        type="text"
                        id="nomeCompleto"
                        className="form-input"
                        value={nomeCompleto}
                        onChange={handleNomeCompletoChange}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="idade" className="form-label">Idade:</label>
                    <input
                        type="number"
                        id="idade"
                        className="form-input"
                        value={idade}
                        onChange={handleIdadeChange}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Sexo:</label>
                    <div className="radio-group">
                        <label htmlFor="masculino" className="radio-label">
                            <input
                                type="radio"
                                id="masculino"
                                className="radio-input"
                                value="masculino"
                                checked={sexo === 'masculino'}
                                onChange={handleSexoChange}
                            />
                            Masculino
                        </label>
                        <label htmlFor="feminino" className="radio-label">
                            <input
                                type="radio"
                                id="feminino"
                                className="radio-input"
                                value="feminino"
                                checked={sexo === 'feminino'}
                                onChange={handleSexoChange}
                            />
                            Feminino
                        </label>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="interesses" className="form-label">Interesses:</label>
                    <input
                        type="text"
                        id="interesses"
                        className="form-input"
                        value={interesses}
                        onChange={handleInteressesChange}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="profissao" className="form-label">Profissão:</label>
                    <input
                        type="text"
                        id="profissao"
                        className="form-input"
                        value={profissao}
                        onChange={handleProfissaoChange}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="biografia" className="form-label">Biografia:</label>
                    <textarea
                        id="biografia"
                        className="form-input"
                        value={biografia}
                        onChange={handleBiografiaChange}
                    ></textarea>
                </div>
                <button type="submit" className="login-button">Salvar</button>
            </form>
        </div>
    );

    const Container2 = () => (
        <div>
            {/* Container para a aba Interesses */}
        </div>
    );

    return (
        <div className="dados-container" style={{ overflow: 'hidden', overflowY: 'auto' }}>
            <TopMenu />
            <h1></h1>
            <div className="espaco-publicacoes"></div>

            <div className="login-content">
                <TopMenu />
                <div>
                    <div className="tab-buttons">
                        <button
                            className={`tab-button ${activeTab === 0 ? 'active' : ''}`}
                            onClick={() => setActiveTab(0)}
                        >
                            Dados
                        </button>
                        <button
                            className={`tab-button ${activeTab === 1 ? 'active' : ''}`}
                            onClick={() => setActiveTab(1)}
                        >
                            Interesses
                        </button>
                    </div>

                    <div className="tab-buttons">
                        {activeTab === 0 && <Container1 />}
                        {activeTab === 1 && <Container2 />}
                    </div>
                </div>
                <ToastContainer />
            </div>
        </div>
    );
};

export default TelaDadosPessoa;
