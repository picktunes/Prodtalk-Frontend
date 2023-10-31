import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
    },
};


const NotificacoesModal = ({ closeModal }) => {
    const [notificacoes, setNotificacoes] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const idPessoa = Number(localStorage.getItem('idPessoa'));
                const response = await axios.get(`http://localhost:8080/notificacao?idPessoa=${idPessoa}`);
                const notificacoesData = response.data;
                setNotificacoes(notificacoesData);
                console.log('Notificações:', notificacoesData);
            } catch (error) {
                console.error('Erro ao buscar notificações:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <Modal
            isOpen={true} // O modal sempre está aberto
            onRequestClose={closeModal}
            style={customStyles} // Aplicando o estilo personalizado
            contentLabel="Notificações"
        >
            <div>
                <h2>Notificações</h2>
                <ul>
                    {notificacoes.map((notificacao, index) => (
                        <li key={index}>
                            Tipo de Notificação: {notificacao.idTipoNotificacao}<br />
                            ID da Publicação: {notificacao.idPublicacao}<br />
                            Número de Notificações: {notificacao.nrNotificacoes}
                        </li>
                    ))}
                </ul>
                <button onClick={closeModal}>Fechar</button>
            </div>
        </Modal>
    );
};

export default NotificacoesModal;
