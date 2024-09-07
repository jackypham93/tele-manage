import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListGroup, Button, Dropdown, InputGroup } from 'bootstrap-4-react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const host = 'http://localhost:3001'

const Dashboard = () => {
  const [listGroup, setListGroup] = useState([])
  const [activeIndex, setActiveIndex] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  const handleClick = (index) => {
    setActiveIndex(index);
    setSelectedGroup(listGroup[index].group_id)
  };

  const handleSendMessage = async () => {
    try {
      if (inputValue.trim()) {
        setInputValue('');
        const TOKEN = localStorage.getItem('TOKEN')
        let resp = await axios.post(`${host}/api/send_message`, {
          group_id: selectedGroup,
          message: inputValue.trim()
        }, {
          headers: {
            'Authorization': `Bearer ${TOKEN}`
          }
        })
        console.log('resp', resp);
        setMessages([...messages, { id: resp.data.message_id, text: inputValue }]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteMessage = async (id) => {
      try {
        if(window.confirm('Are you sure?')){
          const TOKEN = localStorage.getItem('TOKEN')
          await axios.delete(`${host}/api/delete_message?group_id=${selectedGroup}&msg_id=${id}`, {
            headers: {
              'Authorization': `Bearer ${TOKEN}`
            }
          })
          setMessages(messages.filter(message => message.id !== id));
          toast.success('Delete successfully!', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light"
          });
        }
      } catch (error) {
        console.log(error);
        toast.error(error.response.data, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light"
        });
      }
  };

  const handleEditMessage = async (id, new_text) => {
      try {
        const TOKEN = localStorage.getItem('TOKEN')
        await axios.put(`${host}/api/update_message`, {
          group_id: selectedGroup,
          message_id: id,
          new_text: new_text
        }, {
          headers: {
            'Authorization': `Bearer ${TOKEN}`
          }
        })
        setMessages(messages.map(message =>
            message.id === id ? { ...message, text: new_text } : message
        ));
        toast.success('Update successfully!', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light"
        });
      } catch (error) {
        console.log(error);
        toast.error(error.response.data, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light"
        });
      }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleSendMessage();
    }
  };

  useEffect(() => {
    try {
      const TOKEN = localStorage.getItem('TOKEN')
      axios.get(`${host}/api/list_groups`, {
        headers: {
          'Authorization': `Bearer ${TOKEN}`
        }
      }).then(res => {
        setListGroup(res.data.data)
      })
    } catch (error) {
      console.log(error);
    }
  }, [])

  return (
    <div className="container mt-4">
      <h2>Dashboard</h2>
      <button onClick={handleLogout} className="btn btn-danger">Logout</button>

      <h5 className='mt-4'>List of Groups</h5>
      <ListGroup>
        {listGroup.map((item, index) => (
          <ListGroup.Item
            key={index}
            active={activeIndex === index}
            onClick={() => handleClick(index)}
          >
            {item.group_name}
          </ListGroup.Item>
        ))}
      </ListGroup>

      {
        activeIndex != null && 
        <div className="container mt-4" style={{border: '1px solid', padding: '25px'}}>
          <ListGroup>
              {messages.map((message) => (
                  <ListGroup.Item key={message.id}>
                      <div className="d-flex justify-content-between align-items-center">
                          <span>{message.text}</span>
                          <Dropdown>
                              <Dropdown.Button secondary id="dropdownMenuButton"></Dropdown.Button>
                              <Dropdown.Menu aria-labelledby="dropdownMenuButton">
                                <Dropdown.Item onClick={() => {
                                  const newText = prompt("Edit message:", message.text);
                                  console.log('message', message);
                                  if (newText !== null) handleEditMessage(message.id, newText);
                                }}>Edit</Dropdown.Item>
                                <Dropdown.Item onClick={() => handleDeleteMessage(message.id)} >Delete</Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                      </div>
                  </ListGroup.Item>
              ))}
          </ListGroup>
          <InputGroup style={{marginTop: '50%'}}>
              <input
                  type="text"
                  className="form-control"
                  placeholder="Type a message..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={{width: '50%'}}
              />
              <InputGroup.Prepend>
                  <Button variant="primary" onClick={handleSendMessage}>Send</Button>
              </InputGroup.Prepend>
          </InputGroup>
          <ToastContainer />
        </div>
      }
    </div>
  );
};

export default Dashboard;
