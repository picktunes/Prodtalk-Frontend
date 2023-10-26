import React, { useState, useEffect } from 'react';
import './TemaPadrao.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TopMenu from './TopMenu';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const TelaDadosPessoa = () => {
    const [conteudoSelecionado, setConteudoSelecionado] = useState('perfil');
    const [formData, setFormData] = useState({
        nomeCompleto: '',
        idade: null,
        sexo: 'masculino', // Valor padrão
        profissao: '',
        biografia: '',
    });
    const [showChangePasswordPopup, setShowChangePasswordPopup] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [file, setFile] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const storedData = {
            nomeCompleto: localStorage.getItem('nomeCompleto') || '',
            profissao: localStorage.getItem('profissao') || '',
            biografia: localStorage.getItem('biografia') || '',
            senha: localStorage.getItem('senha') || '',
            email: localStorage.getItem('email') || '',
            login: localStorage.getItem('login') || '',
        };
        setFormData((prevData) => ({ ...prevData, ...storedData }));
    }, []);

    const handleItemClick = (item) => {
        setConteudoSelecionado(item);
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleIdadeChange = (date) => {
        setFormData((prevData) => ({ ...prevData, idade: date }));
    };

    const openChangePasswordPopup = () => {
        setShowChangePasswordPopup(true);
    };

    const closeChangePasswordPopup = () => {
        setShowChangePasswordPopup(false);
    };

    const handleSalvarPessoa = async (e) => {
        e.preventDefault();

        const idPessoa = Number(localStorage.getItem('idPessoa'));

        if (!formData.nomeCompleto || !formData.idade || !formData.sexo) {
            toast.error("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        // Calcula a idade a partir da data de nascimento
        const dataNascimento = formData.idade;
        const dataAtual = new Date();
        const diff = dataAtual.getFullYear() - dataNascimento.getFullYear();

        let pessoaIdade = 0;

        // Verifica se o aniversário ainda não ocorreu neste ano
        if (dataAtual.getMonth() < dataNascimento.getMonth() ||
            (dataAtual.getMonth() === dataNascimento.getMonth() && dataAtual.getDate() < dataNascimento.getDate())) {
            pessoaIdade = diff - 1; // Se ainda não fez aniversário neste ano, subtrai 1 da idade.
        } else {
            pessoaIdade = diff; // Caso contrário, mantém a idade calculada.
        }

        let base64 = null;
        if (file) {
            const reader = new FileReader();
            base64 = await new Promise((resolve) => {
                reader.onload = function () {
                    base64 = reader.result.split(',')[1];
                    resolve(base64);
                };
                reader.readAsDataURL(file);
            });
        }

        const pessoaData = {
            idPessoa,
            nomeCompleto: formData.nomeCompleto,
            idade: pessoaIdade, // Usando a idade calculada
            sexo: formData.sexo,
            profissao: formData.profissao || null,
            fotoPerfil: base64,
            biografia: formData.biografia || null
        };

        try {
            await axios.put('http://localhost:8080/pessoa', pessoaData);

            const userData = {
                nomeCompleto: formData.nomeCompleto,
                interesses: formData.interesses || null,
                profissao: formData.profissao || null,
                biografia: formData.biografia || null,
            };

            localStorage.setItem('nomeCompleto', userData.nomeCompleto);
            localStorage.setItem('interesses', userData.interesses);
            localStorage.setItem('profissao', userData.profissao);
            localStorage.setItem('biografia', userData.biografia);

            toast.success("Alterações realizadas com sucesso!");
        } catch (error) {
            toast.error(error.response.data);
        }
    };

    const handleSalvarCadastro = (e) => {
        e.preventDefault();

        const idCadastro = Number(localStorage.getItem('idCadastro'));

        // Verifica se o email e login não estão vazios antes de enviar a atualização
        if (!formData.email || !formData.login) {
            toast.error("Por favor, preencha todos os campos.");
            return;
        }

        const cadastroData = {
            idCadastro,
            email: formData.email,
            login: formData.login,
        };

        axios.put('http://localhost:8080/cadastro', cadastroData)
            .then((response) => {
                // Atualize as informações da sessão do usuário após a atualização bem-sucedida
                localStorage.setItem('email', formData.email);
                localStorage.setItem('login', formData.login);

                toast.success("Configurações de conta atualizadas com sucesso!");
            })
            .catch((error) => {
                toast.error(error.response.data);
            });
    };


    const changePasswordOnClick = () => {
        if (newPassword !== confirmNewPassword) {
            toast.error("As senhas não coincidem.");
            return;
        }

        const idCadastro = Number(localStorage.getItem('idCadastro'));

        const cadastro = {
            idCadastro,
            senha: newPassword
        };

        axios.put('http://localhost:8080/cadastro-atualizar-senha', cadastro) // Substitua 'alterar-senha' pelo endpoint correto
            .then((response) => {
                toast.success("Senha alterada com sucesso!");
                setNewPassword('');
                setConfirmNewPassword('');
                closeChangePasswordPopup();
            })
            .catch((error) => {
                toast.error(error.response.data);
            });
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

    return (
        <div className="conteudo-centralizado">
            <TopMenu />
            <h1></h1>

            <div className="container-centralizador">
                <div className="lateral">
                    <div className="item-titulo">Configurações</div>
                    <div className="item">
                        <a
                            href="#"
                            className={`link ${conteudoSelecionado === 'perfil' ? 'ativo' : ''}`}
                            onClick={() => handleItemClick('perfil')}
                        >
                            Perfil
                        </a>
                    </div>
                    <div className="item">
                        <a
                            href="#"
                            className={`link ${conteudoSelecionado === 'configuracoes' ? 'ativo' : ''}`}
                            onClick={() => handleItemClick('configuracoes')}
                        >
                            Configurações
                        </a>
                    </div>
                    <div className="item">
                        <a
                            href="#"
                            className={`link ${conteudoSelecionado === 'privacidade' ? 'ativo' : ''}`}
                            onClick={() => handleItemClick('privacidade')}
                        >
                            Privacidade
                        </a>
                    </div>
                </div>

                <div className="conteudo">
                    {conteudoSelecionado === 'perfil' && (
                        <form onSubmit={handleSalvarPessoa}>
                            <div className="dados-pessoa-form">
                                <h2>Informações da Pessoa</h2>
                                <div className="form-group">
                                    <label htmlFor="imagem">Foto de perfil(pgn ou jpg): </label>
                                    <input type="file" id="imagem" accept="image/png, image/jpeg" onChange={handleImageChange} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="nomeCompleto">Nome Completo</label>
                                    <input
                                        type="text"
                                        id="nomeCompleto"
                                        name="nomeCompleto"
                                        value={formData.nomeCompleto}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Sexo</label>
                                    <div className="radio-group">
                                        <label>
                                            <input
                                                type="radio"
                                                name="sexo"
                                                value="masculino"
                                                checked={formData.sexo === 'masculino'}
                                                onChange={handleInputChange}
                                            />
                                            Masculino
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                name="sexo"
                                                value="feminino"
                                                checked={formData.sexo === 'feminino'}
                                                onChange={handleInputChange}
                                            />
                                            Feminino
                                        </label>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="idade" className="label-data-nascimento">Data de nascimento</label>
                                    <DatePicker
                                        selected={formData.idade}
                                        onChange={handleIdadeChange}
                                        dateFormat="dd/MM/yyyy"
                                        showYearDropdown
                                        scrollableYearDropdown
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="profissao">Profissão/Ocupação</label>
                                    <input
                                        type="text"
                                        id="profissao"
                                        name="profissao"
                                        value={formData.profissao}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="biografia">Biografia</label>
                                    <textarea
                                        id="biografia"
                                        name="biografia"
                                        rows="4"
                                        value={formData.biografia}
                                        onChange={handleInputChange}
                                    ></textarea>
                                </div>

                                <button type="submit">Salvar</button>
                            </div>
                        </form>
                    )}

                    {conteudoSelecionado === 'configuracoes' && (
                        <div id="conteudo-configuracoes">
                            <div className="dados-pessoa-form">
                                <h2>Configurações de conta</h2>

                                <div className="form-group">
                                    <label htmlFor="email">E-mail</label>
                                    <input
                                        type="text"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="login">Login</label>
                                    <input
                                        type="text"
                                        id="login"
                                        name="login"
                                        value={formData.login}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Senha</label>
                                    <div>
                                        <a href="#" onClick={openChangePasswordPopup}>Alterar senha</a>
                                    </div>
                                </div>

                                <button type="submit" onClick={handleSalvarCadastro}>
                                    Salvar Configurações
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Popup de alteração de senha */}
                    {showChangePasswordPopup && (
                        <div className="popup-overlay">
                            <div className="popup-container">
                                <div className="popup">
                                    <button className="popup-close-button" onClick={closeChangePasswordPopup}>
                                        X
                                    </button>
                                    <h3>Alterar Senha</h3>
                                    <div className="form-group">
                                        <label htmlFor="newPassword">Nova Senha</label>
                                        <div></div>
                                        <input
                                            type="password"
                                            id="newPassword"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="confirmNewPassword">Confirmar Nova Senha</label>
                                        <div></div>
                                        <input
                                            type="password"
                                            id="confirmNewPassword"
                                            value={confirmNewPassword}
                                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                                        />
                                    </div>
                                    <button type="button" onClick={changePasswordOnClick}>
                                        Salvar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}


                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default TelaDadosPessoa;
