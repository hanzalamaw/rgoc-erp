// RoomDistribution.jsx
import React, { useState, useEffect } from 'react';
import './RoomDistribution.css';

const mockTrips = [
  { id: 1, name: 'Umrah Trip July 2025' },
  { id: 2, name: 'Umrah Trip August 2025' },
];

const mockParticipants = [
  { id: 1, name: 'Ameer Sahab', tripId: 1 },
  { id: 2, name: 'Hanzala MA Wahab', tripId: 1 },
  { id: 3, name: 'Junaid Hashmi', tripId: 1 },
  { id: 4, name: 'Sajid Niece', tripId: 1 },
  { id: 5, name: 'Neelam Sajid', tripId: 1 },
  { id: 6, name: 'Ayan Sajid', tripId: 1 },
  { id: 7, name: 'Sabra Sultana', tripId: 1 },
  { id: 8, name: 'Muhammad Uzair Siddiqui', tripId: 1 },
  { id: 9, name: 'Yousuf Rehman', tripId: 1 },
  { id: 10, name: 'Arsalan', tripId: 1 },
  { id: 11, name: 'Muhammad Mustafa Sajid', tripId: 1 },
];

function getRoomType(count) {
  if (count === 2) return 'Double';
  if (count === 3) return 'Triple';
  if (count === 4) return 'Quad';
  if (count === 5) return 'Quint';
  return `Custom (${count})`;
}

export default function RoomDistribution() {
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    if (selectedTrip) {
      const filtered = mockParticipants.filter(p => p.tripId === parseInt(selectedTrip));
      setParticipants(filtered);
      setSelectedParticipants([]);
      setRooms([]);
    }
  }, [selectedTrip]);

  const togglePerson = (person) => {
    setSelectedParticipants(prev =>
      prev.includes(person)
        ? prev.filter(p => p !== person)
        : [...prev, person]
    );
  };

  const createRoom = () => {
    if (selectedParticipants.length < 2) return alert('Select at least 2 people');
    setRooms(prev => [...prev, selectedParticipants]);
    setParticipants(prev => prev.filter(p => !selectedParticipants.includes(p)));
    setSelectedParticipants([]);
  };

  return (
    <div className="room-container">
      <h2 className="title">Umrah Room Distribution</h2>

      <label className="label">Select Trip:</label>
      <select
        className="dropdown"
        onChange={(e) => setSelectedTrip(e.target.value)}
        value={selectedTrip || ''}
      >
        <option value="">-- Choose Trip --</option>
        {mockTrips.map(trip => (
          <option key={trip.id} value={trip.id}>{trip.name}</option>
        ))}
      </select>

      {selectedTrip && (
        <>
          <h3 className="subheading">Participants</h3>
          <div className="grid">
            {participants.map(person => (
              <div
                key={person.id}
                className={`person-card ${selectedParticipants.includes(person) ? 'selected' : ''}`}
                onClick={() => togglePerson(person)}
              >
                <input type="checkbox" checked={selectedParticipants.includes(person)} readOnly />
                <span>{person.name}</span>
              </div>
            ))}
          </div>

          <button className="create-button" onClick={createRoom}>Create Room</button>

          <h3 className="subheading">Assigned Rooms</h3>
          {rooms.length === 0 ? (
            <p className="muted-text">No rooms assigned yet.</p>
          ) : (
            rooms.map((room, index) => (
              <div key={index} className="room-box">
                <h4 className="room-title">Room {index + 1} - {getRoomType(room.length)}</h4>
                <ul>
                  {room.map(p => <li key={p.id}>{p.name}</li>)}
                </ul>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}