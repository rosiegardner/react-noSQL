import React, { useEffect, useState } from 'react';
import NewTicketForm from './NewTicketForm';
import TicketList from './TicketList';
import EditTicketForm from './EditTicketForm';
import TicketDetail from './TicketDetail';
import db from './../firebase.js';
import { collection, addDoc, doc, updateDoc, onSnapshot, deleteDoc } from 'firebase/firestore';

function TicketControl() {
  const [formVisibleOnPage, setFormVisibleOnPage] = useState(false);
  const [mainTicketList, setMainTicketList] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(null);

  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     formVisibleOnPage: false,
  //     mainTicketList: [],
  //     selectedTicket: null,
  //     editing: false
  //   };
  // }

  useEffect(() => {
    const unSubscribe = onSnapshot(
      collection(db, "tickets"),
      (collectionSnapshot) => {
        const tickets = [];
        collectionSnapshot.forEach((doc) => {
          tickets.push({
            // ...doc.data(), -> using spread operator 
            names: doc.data().names,
            location: doc.data().location,
            issue: doc.data().issue,
            id: doc.id 
          });
        });
        setMainTicketList(tickets);
      },
        (error) => {
          setError(error.message);
        }
    );
    return () => unSubscribe();
  }, []);
  
  const handleClick = () => {
    if (selectedTicket != null) {
      setFormVisibleOnPage(false);
      setSelectedTicket(null);
      setEditing(false);
    } else {
      setFormVisibleOnPage(!formVisibleOnPage);
    }
  }

  const handleAddingNewTicketToList = async (newTicketData) => {
    // const collectionRef = collection(db, "tickets");
    // await addDoc(collectionRef, newTicketData);
    await addDoc(collection(db, "tickets"), newTicketData);
    setFormVisibleOnPage(false);
  }

  const handleDeletingTicket = (id) => {
    const newMainTicketList = mainTicketList
      .filter(ticket => ticket.id !== id);
    setMainTicketList(newMainTicketList);
    setSelectedTicket(null);
  }

  const handleEditClick = () => {
    setEditing(true);
  }

  const handleEditingTicketInList = async (ticketToEdit) => {
    // const ticketRef = doc(db, "tickets", ticketToEdit.id);
    // await updateDoc(ticketRef, ticketToEdit);
    await updateDoc(doc(db, "tickets", ticketToEdit.id), ticketToEdit);
    setEditing(false);
    setSelectedTicket(null);
    // const editedMainTicketList = mainTicketList       -> old code.
    //   .filter(ticket => ticket.id !== selectedTicket.id)
    //   .concat(ticketToEdit);
    // setMainTicketList(editedMainTicketList);
  }

  const handleChangingSelectedTicket = (id) => {
    const selection = mainTicketList
      .filter(ticket => ticket.id === id)[0];
    setSelectedTicket(selection);
  }

  
  let currentlyVisibleState = null;
  let buttonText = null; 

  if (error) {
    currentlyVisibleState =
      <p>There was an Error: {error}</p>
  }else if (editing) {      
    currentlyVisibleState = 
      <EditTicketForm 
        ticket = {selectedTicket} 
        onEditTicket = {handleEditingTicketInList} />
    buttonText = "Return to Ticket List";
  } else if (selectedTicket != null) {
    currentlyVisibleState =
      <TicketDetail 
        ticket={selectedTicket} 
        onClickingDelete={handleDeletingTicket}
        onClickingEdit = {handleEditClick} />
    buttonText = "Return to Ticket List";
  } else if (formVisibleOnPage) {
    currentlyVisibleState = 
      <NewTicketForm 
        onNewTicketCreation={handleAddingNewTicketToList}/>;
    buttonText = "Return to Ticket List"; 
  } else {
    currentlyVisibleState = 
      <TicketList 
        onTicketSelection={handleChangingSelectedTicket} 
        ticketList={mainTicketList} />;
    buttonText = "Add Ticket"; 
  }
  return (
    <React.Fragment>
      {currentlyVisibleState}
      { error ? null : <button onClick={handleClick}>{buttonText}</button> } 
    </React.Fragment>
  );
  
}

export default TicketControl;

