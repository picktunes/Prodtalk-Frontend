import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Dropdown from 'react-dropdown-select';
import Modal from 'react-modal';
const customStyles = {
    content: {
        width: '20%',
        height: '50%',
        top: '7%',
        left: '18%',
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
};

const options = [
    { value: 'exit', label: 'Sair' },
];

Modal.setAppElement('#root');

const TopMenu = ({ onSearchSubmit }) => {
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const [selectedOption, setSelectedOption] = useState('');
    const [searchText, setSearchText] = useState('');
    const [notificacoes, setNotificacoes] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSearchInputChange = (e) => {
        setSearchText(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        onSearchSubmit(searchText);
    };

    const handleNotificacaoClick = async () => {
        setIsModalOpen(true);

        try {
            const idPessoa = Number(localStorage.getItem('idPessoa'));
            const response = await axios.get(`http://localhost:8080/notificacao?idPessoa=${idPessoa}`);

            const notificacoesData = response.data;
            console.log('Notificações:', notificacoesData);

            setNotificacoes(notificacoesData);

        } catch (error) {
            console.error('Erro ao buscar notificações:', error);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    useEffect(() => {

        const handleDocumentClick = (e) => {
            if (isModalOpen && !e.target.closest('.ReactModal__Content')) {
                closeModal();
            }
        };

        document.addEventListener('mousedown', handleDocumentClick);

        return () => {
            document.removeEventListener('mousedown', handleDocumentClick);
        };
    }, [isModalOpen]);

    useEffect(() => {
        const storedUser = localStorage.getItem('nomeCompleto');
        setSelectedOption(storedUser || '');

        const containerWidth = containerRef.current.offsetWidth;
        const iconSize = Math.min(containerWidth / 5, 30);
        const svgElements = containerRef.current.querySelectorAll('svg');
        svgElements.forEach(svgElement => {
            svgElement.style.width = `${iconSize}px`;
            svgElement.style.height = `${iconSize}px`;
        });
    }, []);

    const handleOptionChange = event => {
        const selectedValue = event.target.value;
        if (selectedValue === 'exit') {
            localStorage.clear();
            navigate('/');
        } else {
            setSelectedOption(selectedValue);
        }
    };

    return (
        <div className="topMenu">
            <div className="centered-buttons" ref={containerRef}>
                <Link to="/TelaInicial" className="menu-button">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="black">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
                </Link>
                <div onClick={handleNotificacaoClick} className="menu-button">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="black">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                </div >
                <Link to="/TelaCategorias" className="menu-button">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="black">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                    </svg>
                </Link>
                <Link to="/TelaDadosPessoa" className="menu-button">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="black">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                </Link>
                <Link to="/TelaCategorias" className="menu-button">
                    <svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="m10.5 17.25c0-.414.336-.75.75-.75h10c.414 0 .75.336.75.75s-.336.75-.75.75h-10c-.414 0-.75-.336-.75-.75zm-1.5-3.55c0-.53-.47-1-1-1h-5c-.53 0-1 .47-1 1v4.3c0 .53.47 1 1 1h5c.53 0 1-.47 1-1zm-5.5.5h4v3.3h-4zm7-2.2c0-.414.336-.75.75-.75h10c.414 0 .75.336.75.75s-.336.75-.75.75h-10c-.414 0-.75-.336-.75-.75zm-1.5-6c0-.53-.47-1-1-1h-5c-.53 0-1 .47-1 1v4.3c0 .53.47 1 1 1h5c.53 0 1-.47 1-1zm-5.5.5h4v3.3h-4zm7 .25c0-.414.336-.75.75-.75h10c.414 0 .75.336.75.75s-.336.75-.75.75h-10c-.414 0-.75-.336-.75-.75z" fill-rule="nonzero" />
                    </svg>
                </Link>
                <form onSubmit={handleSearchSubmit}>
                    <input
                        className="search-bar"
                        type="text"
                        placeholder="O que você deseja procurar?"
                        style={{ width: '500px' }}
                        value={searchText}
                        onChange={handleSearchInputChange}
                    />
                </form>
                <Dropdown
                    styles={{ ...customStyles, zIndex: 999999999 }}
                    options={options}
                    values={selectedOption ? [{ value: selectedOption, label: selectedOption }] : []}
                    onChange={(value) => {
                        const selectedValue = value[0].value;
                        if (selectedValue === 'exit') {
                            localStorage.clear();
                            navigate('/');
                        } else {
                            setSelectedOption(selectedValue);
                        }
                    }}
                />
            </div>

            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                ariaHideApp={false}
                style={customStyles}
            >
                {notificacoes && notificacoes.length > 0 ? (
                    notificacoes.map((notificacao, index) => (
                        <div key={index} className="notification-item">
                            <p>
                                <img src={`data: image / jpeg; base64, ${notificacao.publicacao.img} `} className="imagem-30px-middle" />
                                {notificacao.nrNotificacoes === 1 ? 'Existe ' : 'Existem '}
                                {notificacao.nrNotificacoes}
                                {' '}
                                {notificacao.nrNotificacoes === 1 ? (
                                    notificacao.idTipoNotificacao === 1 ? 'novo' : 'nova'
                                ) : (
                                    notificacao.idTipoNotificacao === 1 ? 'novos' : 'novas'
                                )}
                                {' '}
                                {notificacao.idTipoNotificacao === 1 ? 'Comentário' : 'Curtida'}
                                {' '}
                                na publicação:{' '}
                                <strong>
                                    {notificacao.publicacao.titulo || notificacao.publicacao.conteudo.substring(0, 80)}
                                </strong>.
                            </p>
                            {index < notificacoes.length - 1 && (
                                <div className="notification-separator"></div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="notification-empty">
                    </div>
                )}
            </Modal>
        </div >
    );
};

export default TopMenu;
