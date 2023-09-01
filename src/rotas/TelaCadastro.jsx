import React, { useState } from 'react';
import './TemaPadrao.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TelaCadastro = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [login, setLogin] = useState('');
    const [senha, setSenha] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [senhaIguais, setSenhaIguais] = useState(true);
    const [statusCadastro, setStatusCadastro] = useState(undefined);

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handleLoginChange = (e) => {
        setLogin(e.target.value);
    };

    const handleSenhaChange = (e) => {
        setSenha(e.target.value);
    };

    const handleConfirmarSenhaChange = (e) => {
        setConfirmarSenha(e.target.value);
    };

    const handleSalvar = (e) => {
        e.preventDefault();

        if (senha !== confirmarSenha) {
            setSenhaIguais(false);
            return;
        }

        axios.post('http://localhost:8080/cadastro', {
            email: email,
            login: login,
            senha: senha
        }).then(response => {
            setMensagem('Cadastro realizado com sucesso!');
            setEmail('');
            setLogin('');
            setSenha('');
            setConfirmarSenha('');
            setSenhaIguais(true);
            setStatusCadastro('success');
            navigate('/');
        }).catch(error => {
            toast.error(error.response.data);
        });
    };

    const handleVoltar = (e) => {
        navigate('/');
    };

    return (
        <div className="login-container">
            <div className="login-background"></div>
            <div className="login-content">
                <h2 className="login-heading">Página de Cadastro</h2>
                <form onSubmit={handleSalvar} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email:</label>
                        <input
                            type="email"
                            id="email"
                            className="form-input"
                            value={email}
                            onChange={handleEmailChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="login" className="form-label">Login:</label>
                        <input
                            type="text"
                            id="login"
                            className="form-input"
                            value={login}
                            onChange={handleLoginChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="senha" className="form-label">Senha:</label>
                        <input
                            type="password"
                            id="senha"
                            className="form-input"
                            value={senha}
                            onChange={handleSenhaChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmarSenha" className="form-label">Confirmar Senha:</label>
                        <input
                            type="password"
                            id="confirmarSenha"
                            className="form-input"
                            value={confirmarSenha}
                            onChange={handleConfirmarSenhaChange}
                        />
                    </div>
                    {!senhaIguais && <p className="error-message">As senhas não são iguais, por favor verifique.</p>}
                    {statusCadastro === 'error' && <p className="error-message">Erro ao realizar o cadastro. </p>}
                    {statusCadastro === 'success' && <p className="success-message">Cadastro realizado com sucesso!</p>}
                    <button type="submit" className="login-button">Salvar</button>
                    <button type="button" className="back-button" onClick={handleVoltar}>Voltar</button>
                </form>
            </div>
            <ToastContainer />
        </div>
    );
};

export default TelaCadastro;