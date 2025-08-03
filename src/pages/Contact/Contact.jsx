import React, { useState, useEffect } from 'react';
import './Contact.css';
import { CONTACT_API } from '../../util/Globalapi';

const Contact = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'descending'
  });

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch(CONTACT_API.LIST);
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        setContacts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, []);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortedAndFilteredItems = () => {
    const filteredItems = contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.phone && contact.phone.toLowerCase().includes(searchTerm.toLowerCase())) || // Add phone search
      contact.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filteredItems.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  const renderSortIcon = (name) => {
    if (sortConfig.key !== name) return null;
    return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
  };

  const sortedContacts = getSortedAndFilteredItems();

  return (
    <div className="contact-container">
      <div className="contact-header">
        <h1>Contact Submissions</h1>
        <p>Review and manage inquiries submitted via the contact form.</p>
      </div>

      <div className="contact-form-container">
        <div className="flex-col">
          <label htmlFor="search">Search Submissions</label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, phone, or subject..."
          />
        </div>
      </div>

      <div className="contact-list-container">
        {loading ? (
          <div className="empty-state">Loading submissions...</div>
        ) : error ? (
          <div className="empty-state">Error: {error}</div>
        ) : sortedContacts.length === 0 ? (
          <div className="empty-state">No matching submissions found.</div>
        ) : (
          <table className="contact-table">
            <thead>
              <tr>
                <th onClick={() => requestSort('name')}>Name{renderSortIcon('name')}</th>
                <th onClick={() => requestSort('email')}>Email{renderSortIcon('email')}</th>
                <th onClick={() => requestSort('phone')}>Phone{renderSortIcon('phone')}</th>
                <th onClick={() => requestSort('subject')}>Subject{renderSortIcon('subject')}</th>
                <th>Message</th>
                <th onClick={() => requestSort('createdAt')}>Submitted{renderSortIcon('createdAt')}</th>
              </tr>
            </thead>
            <tbody>
              {sortedContacts.map((contact) => (
                <tr key={contact._id}>
                  <td>{contact.name}</td>
                  <td><a href={`mailto:${contact.email}`}>{contact.email}</a></td>
                  <td>{contact.phone || '-'}</td> {/* Added phone cell */}
                  <td>{contact.subject}</td>
                  <td className="truncate-text">{contact.message}</td>
                  <td>{formatDate(contact.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Contact;