import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  MessageCircle, 
  Send, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';

const ProviderDashboard = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('patients');
  
  // Messaging state
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [patientsRes, emergenciesRes, conversationsRes] = await Promise.all([
        api.get('/admin/patients?region=' + user.region),
        api.get('/emergency'),
        api.get('/chat/conversations'),
      ]);
      // Data is already extracted by the API interceptor
      setPatients(patientsRes);
      setEmergencies(emergenciesRes.filter(e => e.status !== 'resolved'));
      setConversations(conversationsRes || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientClick = async (patientId) => {
    try {
      const response = await api.get(`/admin/patients/${patientId}`);
      // Data is already extracted by the API interceptor
      setSelectedPatient(response);
    } catch (error) {
      console.error('Error fetching patient details:', error);
    }
  };

  const handleEmergencyResponse = async (emergencyId, status, notes) => {
    try {
      await api.put(`/emergency/${emergencyId}`, { status, providerNotes: notes });
      fetchData();
    } catch (error) {
      console.error('Error updating emergency:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation) return;
    
    setSendingMessage(true);
    try {
      const response = await api.post(`/chat/conversations/${selectedConversation.id}/messages`, {
        content: messageText,
      });
      // Add the new message to the conversation
      setSelectedConversation(prev => ({
        ...prev,
        messages: [...(prev.messages || []), response]
      }));
      // Update the conversation list with the new last message
      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation.id 
          ? { ...conv, lastMessage: messageText }
          : conv
      ));
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const selectConversation = async (conversation) => {
    try {
      const response = await api.get(`/chat/conversations/${conversation.id}/messages`);
      setSelectedConversation({ ...conversation, messages: response || [] });
    } catch (error) {
      console.error('Error fetching messages:', error);
      setSelectedConversation({ ...conversation, messages: [] });
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation?.messages]);

  // Poll for new messages when a conversation is selected
  useEffect(() => {
    if (!selectedConversation) return;
    
    const interval = setInterval(async () => {
      try {
        const response = await api.get(`/chat/conversations/${selectedConversation.id}/messages`);
        setSelectedConversation(prev => ({
          ...prev,
          messages: response || []
        }));
      } catch (error) {
        console.error('Error polling messages:', error);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [selectedConversation?.id]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Provider Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-sm text-gray-500 mb-1">Total Patients</div>
          <div className="text-3xl font-bold text-primary-500">{patients.length}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500 mb-1">Pending Emergencies</div>
          <div className="text-3xl font-bold text-red-500">{emergencies.filter(e => e.status === 'pending').length}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500 mb-1">Acknowledged</div>
          <div className="text-3xl font-bold text-blue-500">{emergencies.filter(e => e.status === 'acknowledged').length}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500 mb-1">Critical</div>
          <div className="text-3xl font-bold text-orange-500">{emergencies.filter(e => e.severity === 'critical').length}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2">
        <button
          onClick={() => setActiveTab('patients')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'patients' ? 'bg-primary-500 text-white' : 'bg-white text-gray-600'
          }`}
        >
          Patients
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
            activeTab === 'messages' ? 'bg-gradient-to-r from-secondary-500 to-purple-600 text-white' : 'bg-white text-gray-600'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          Messages ({conversations.length})
        </button>
        <button
          onClick={() => setActiveTab('emergencies')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'emergencies' ? 'bg-red-500 text-white' : 'bg-white text-gray-600'
          }`}
        >
          Emergencies ({emergencies.length})
        </button>
      </div>

      {/* Patients Tab */}
      {activeTab === 'patients' && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Patient List</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Name</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Phone</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Pregnancies</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Emergencies</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{patient.fullName}</td>
                    <td className="px-4 py-3 text-gray-600">{patient.phone || 'N/A'}</td>
                    <td className="px-4 py-3">{patient.pregnancyCount}</td>
                    <td className="px-4 py-3">
                      {patient.emergencyCount > 0 && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                          {patient.emergencyCount}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handlePatientClick(patient.id)}
                        className="text-primary-500 hover:underline"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversation List */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-secondary-600" />
              Conversations
            </h2>
            {conversations.length > 0 ? (
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => selectConversation(conv)}
                    className={`w-full p-3 rounded-xl text-left transition-all ${
                      selectedConversation?.id === conv.id
                        ? 'bg-gradient-to-r from-secondary-50 to-purple-50 dark:from-secondary-900/30 dark:to-purple-900/30 border border-secondary-200 dark:border-secondary-500/30'
                        : 'hover:bg-neutral-50 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary-400 to-purple-500 flex items-center justify-center text-white font-medium">
                        {conv.participantName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                          {conv.participantName || 'Unknown User'}
                        </p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                          {conv.lastMessage || 'No messages yet'}
                        </p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="px-2 py-0.5 bg-secondary-500 text-white text-xs rounded-full">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
                <p className="text-neutral-500 dark:text-neutral-400">No conversations yet</p>
              </div>
            )}
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 card">
            {selectedConversation ? (
              <div className="flex flex-col h-[500px]">
                {/* Chat Header */}
                <div className="flex items-center gap-3 pb-4 border-b border-neutral-200 dark:border-neutral-700">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary-400 to-purple-500 flex items-center justify-center text-white font-medium">
                    {selectedConversation.participantName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {selectedConversation.participantName || 'Unknown User'}
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Patient
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="ml-auto p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
                  >
                    <X className="w-5 h-5 text-neutral-500" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto py-4 space-y-4" ref={messagesEndRef}>
                  {selectedConversation.messages?.length > 0 ? (
                    selectedConversation.messages.map((msg, idx) => (
                      <div
                        key={msg.id || idx}
                        className={`flex ${msg.senderRole === 'provider' || msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-2xl ${
                            msg.senderRole === 'provider' || msg.senderId === user?.id
                              ? 'bg-gradient-to-r from-secondary-500 to-purple-600 text-white rounded-br-md'
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-bl-md'
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-xs mt-1 ${
                            msg.senderRole === 'provider' || msg.senderId === user?.id ? 'text-white/70' : 'text-neutral-400'
                          }`}>
                            {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : ''}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
                      <p className="text-neutral-500 dark:text-neutral-400">No messages yet</p>
                      <p className="text-sm text-neutral-400 dark:text-neutral-500">Start the conversation!</p>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 input dark:input-dark"
                    />
                    <button
                      type="submit"
                      disabled={sendingMessage || !messageText.trim()}
                      className="px-4 py-2 bg-gradient-to-r from-secondary-500 to-purple-600 text-white rounded-lg hover:from-secondary-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[500px]">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary-400 to-purple-500 flex items-center justify-center mb-4">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  Select a Conversation
                </h3>
                <p className="text-neutral-500 dark:text-neutral-400 text-center">
                  Choose a conversation from the list to start messaging with patients
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Emergencies Tab */}
      {activeTab === 'emergencies' && (
        <div className="space-y-4">
          {emergencies.length > 0 ? (
            emergencies.map((emergency) => (
              <div key={emergency.id} className={`card border-2 ${getSeverityColor(emergency.severity)}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold capitalize">{emergency.type.replace('-', ' ')}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        emergency.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        emergency.status === 'acknowledged' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {emergency.status}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{emergency.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <span>👤 {emergency.userName}</span>
                      <span>📱 {emergency.userPhone}</span>
                      <span>📍 {emergency.location || 'Not specified'}</span>
                      <span>🕐 {new Date(emergency.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    {emergency.status === 'pending' && (
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => handleEmergencyResponse(emergency.id, 'acknowledged', 'Your report has been received. Please await further instructions.')}
                          className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                        >
                          Acknowledge
                        </button>
                        <button
                          onClick={() => handleEmergencyResponse(emergency.id, 'resolved', 'Case resolved. Contact hospital if symptoms persist.')}
                          className="px-3 py-1 bg-green-500 text-white rounded text-sm"
                        >
                          Resolve
                        </button>
                      </div>
                    )}
                    {emergency.status === 'acknowledged' && (
                      <button
                        onClick={() => handleEmergencyResponse(emergency.id, 'resolved', 'Case resolved.')}
                        className="px-3 py-1 bg-green-500 text-white rounded text-sm"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
                {emergency.providerNotes && (
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <p className="text-sm"><strong>Provider Notes:</strong> {emergency.providerNotes}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="card text-center py-8">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No Active Emergencies</h3>
              <p className="text-gray-500">All emergencies have been resolved.</p>
            </div>
          )}
        </div>
      )}

      {/* Patient Details Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedPatient.patient.fullName}</h2>
                  <p className="text-gray-500">{selectedPatient.patient.email}</p>
                  <p className="text-gray-500">{selectedPatient.patient.phone}</p>
                </div>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Pregnancies */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Pregnancy Records ({selectedPatient.pregnancies.length})</h3>
                  {selectedPatient.pregnancies.length > 0 ? (
                    <div className="space-y-2">
                      {selectedPatient.pregnancies.map((p) => (
                        <div key={p.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between">
                            <span>Week {p.weeks}</span>
                            <span className="text-sm text-gray-500">Due: {new Date(p.dueDate).toLocaleDateString()}</span>
                          </div>
                          {p.notes && <p className="text-sm text-gray-600 mt-1">{p.notes}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No pregnancy records</p>
                  )}
                </div>

                {/* Nutrition Plans */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Nutrition Plans ({selectedPatient.nutritionPlans.length})</h3>
                  {selectedPatient.nutritionPlans.length > 0 ? (
                    <div className="space-y-2">
                      {selectedPatient.nutritionPlans.map((n) => (
                        <div key={n.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium">Trimester {n.trimester}</div>
                          {n.calories && <p className="text-sm text-gray-600">{n.calories} kcal</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No nutrition plans</p>
                  )}
                </div>

                {/* Immunizations */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Immunization Schedules ({selectedPatient.immunizations.length})</h3>
                  {selectedPatient.immunizations.length > 0 ? (
                    <div className="space-y-2">
                      {selectedPatient.immunizations.map((i) => (
                        <div key={i.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium">{i.childName}</div>
                          <p className="text-sm text-gray-600">Born: {new Date(i.dateOfBirth).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No immunization schedules</p>
                  )}
                </div>

                {/* Emergencies */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Emergency Reports ({selectedPatient.emergencies.length})</h3>
                  {selectedPatient.emergencies.length > 0 ? (
                    <div className="space-y-2">
                      {selectedPatient.emergencies.map((e) => (
                        <div key={e.id} className={`p-3 rounded-lg ${getSeverityColor(e.severity)}`}>
                          <div className="flex justify-between">
                            <span className="capitalize">{e.type.replace('-', ' ')}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${e.status === 'resolved' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                              {e.status}
                            </span>
                          </div>
                          <p className="text-sm mt-1">{e.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No emergency reports</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderDashboard;

