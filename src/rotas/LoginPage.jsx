import { toast, ToastContainer } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import React, { useState } from 'react';
import './TemaPadrao.css';
import 'react-toastify/dist/ReactToastify.css';

const LoginPage = () => {
    const navigate = useNavigate();

    const [usuario, setUsuario] = useState('');
    const [senha, setSenha] = useState('');

    const fieldsToSet = [
        'biografia',
        'idPessoa',
        'idade',
        'interesses',
        'nomeCompleto',
        'profissao',
        'sexo'
    ];

    const handleUsuarioChange = (e) => {
        setUsuario(e.target.value);
    };

    const handleSenhaChange = (e) => {
        setSenha(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        axios.get('http://localhost:8080/cadastro', {
            params: {
                email: usuario,
                login: usuario,
                senha: senha
            }
        }).then(response => {
            if (response.data.data.statusCadastro == 2) {
                localStorage.setItem('idCadastro', response.data.data.idCadastro);
                localStorage.setItem('usuario', response.data.data.usuario);
                localStorage.setItem('senha', response.data.data.senha);

                axios.get('http://localhost:8080/pessoa', {
                    params: {
                        idCadastro: response.data.data.idCadastro,
                    }
                }).then(response2 => {
                    fieldsToSet.forEach(fieldName => {
                        const fieldValue = response2.data.data[fieldName];
                        localStorage.setItem(fieldName, fieldValue);
                    });
                    navigate('/TelaInicial');
                }).catch(error => {
                    console.error(error);
                });

            } else if (response.data.data.statusCadastro == 1) {
                navigate('/TelaDadosPessoa');
            } else {
                toast.error("Não foi possível logar no sistema. Verifique usuário e senha.");
            }
        }).catch(error => {
            console.error(error);
        });
    };

    const handleSignup = () => {
        navigate('/telaCadastro');
        console.log('Redirecionar para a página de cadastro');
    };

    return (
        <div className="login-container">
            <div className="login-background"></div>
            <div className="login-content">
                <h1 className="login-heading">ProdTalk</h1>
                <h2 className="login-login-subheading">Login</h2>
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="usuario" className="form-label">Usuário:</label>
                        <input
                            type="text"
                            id="usuario"
                            className="form-input"
                            value={usuario}
                            onChange={handleUsuarioChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor=" " className="form-label">Senha:</label>
                        <input
                            type="password"
                            id="passsenhaword"
                            className="form-input"
                            value={senha}
                            onChange={handleSenhaChange}
                        />
                    </div>
                    <button type="submit" className="login-button">Entrar</button>
                </form>
                <a href="#" className="signup-link" onClick={handleSignup}>
                    Cadastre-se
                </a>
            </div>
            <ToastContainer />
        </div>
    );
};

export default LoginPage;