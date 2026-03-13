import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Phone, 
  MapPin, 
  AlertTriangle, 
  Clock, 
  ChevronRight,
  CheckCircle,
  XCircle,
  Info,
  Siren,
  Heart,
  Thermometer,
  Wind,
  Eye,
  Brain,
  Plus,
  Minus,
  Droplets
} from 'lucide-react';

const emergencyContacts = [
  { name: 'Emergency Services', number: '999', available: '24/7' },
  { name: 'Ambulance', number: '998', available: '24/7' },
  { name: 'Linda Mama Helpline', number: '0800-724-543', available: '24/7' },
  { name: 'National Blood Bank', number: '600-927', available: '24/7' },
];

const firstAidTips = [
  { 
    title: 'Heavy Bleeding', 
    icon: Droplets,
    steps: [
      'Call 999 immediately',
      'Lie down and elevate legs',
      'Place clean cloth on bleeding area',
      'Do not remove soaked cloths'
    ]
  },
  { 
    title: 'Severe Headaches', 
    icon: Brain,
    steps: [
      'Rest in a quiet dark room',
      'Take paracetamol if recommended',
      'Monitor blood pressure',
      'Contact healthcare provider if persists'
    ]
  },
  { 
    title: 'High Fever', 
    icon: Thermometer,
    steps: [
      'Take temperature regularly',
      'Stay hydrated',
      'Use cool compresses',
      'Seek medical attention if above 38°C'
    ]
  },
  { 
    title: 'Reduced Movement', 
    icon: Wind,
    steps: [
      'Have a light snack',
      'Lie on your left side',
      'Count kicks for 2 hours',
      'Contact provider if less than 10 movements'
    ]
  }
];

  const emergencyTypes = [
  { value: 'bleeding', label: 'Vaginal Bleeding', severity: 'high', icon: '🩸' },
  { value: 'severe-pain', label: 'Severe Abdominal Pain', severity: 'high', icon: '💔' },
  { value: 'high-blood-pressure', label: 'High Blood Pressure', severity: 'medium', icon: '💉' },
  { value: 'premature-labor', label: 'Signs of Premature Labor', severity: 'critical', icon: '👶' },
  { value: 'fever', label: 'High Fever', severity: 'medium', icon: '🌡️' },
  { value: 'reduced-movement', label: 'Reduced Baby Movement', severity: 'medium', icon: '👣' },
  { value: 'ambulance', label: 'Request Ambulance', severity: 'critical', icon: '🚑' },
  { value: 'other', label: 'Other Emergency', severity: 'medium', icon: '⚠️' },
];

const Emergency = () => {
  const { user } = useAuth();
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTip, setActiveTip] = useState(null);
  const [formData, setFormData] = useState({
    type: 'bleeding',
    description: '',
    severity: 'medium',
    location: '',
  });

  useEffect(() => {
    fetchEmergencies();
  }, [user]);

  const fetchEmergencies = async () => {
    try {
      const response = await api.get(`/emergency/user/${user.id}`);
      // Data is already extracted by the API interceptor
      setEmergencies(response);
    } catch (error) {
      console.error('Error fetching emergencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/emergency', {
        userId: user.id,
        ...formData,
      });
      setShowForm(false);
      setFormData({
        type: 'bleeding',
        description: '',
        severity: 'medium',
        location: '',
      });
      fetchEmergencies();
    } catch (error) {
      console.error('Error creating emergency:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-danger-100 dark:bg-danger-900/30 text-danger-800 dark:text-danger-300 border-danger-200 dark:border-danger-700';
      case 'high': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-700';
      case 'medium': return 'bg-warning-100 dark:bg-warning-900/30 text-warning-800 dark:text-warning-300 border-warning-200 dark:border-warning-700';
      case 'low': return 'bg-success-100 dark:bg-success-900/30 text-success-800 dark:text-success-300 border-success-200 dark:border-success-700';
      default: return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-300';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-400';
      case 'acknowledged': return 'bg-info-100 dark:bg-info-900/30 text-info-700 dark:text-info-400';
      case 'resolved': return 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400';
      default: return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-400';
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Emergency Reporting</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-danger"
        >
          {showForm ? 'Cancel' : 'Report Emergency'}
        </button>
      </div>

      {/* Emergency Alert Banner */}
      <div className="card bg-gradient-to-r from-danger-500 to-red-600 text-white p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Siren className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">Emergency?</h3>
            <p className="text-danger-100 mb-4">
              If this is a life-threatening emergency, call 999 or go to your nearest hospital immediately.
            </p>
            <a 
              href="tel:999" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-danger-600 rounded-lg font-semibold hover:bg-danger-50 transition-colors"
            >
              <Phone className="w-4 h-4" />
              Call 999 Now
            </a>
          </div>
        </div>
      </div>

      {/* Quick Emergency Contacts */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Phone className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Quick Emergency Contacts</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg-4 gap-:grid-cols4">
          {emergencyContacts.map((contact, idx) => (
            <a
              key={idx}
              href={`tel:${contact.number.replace(/-/g, '')}`}
              className="flex items-center gap-3 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
                <Phone className="w-5 h-5 text-success-600 dark:text-success-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-neutral-800 dark:text-neutral-200">{contact.name}</p>
                <p className="text-sm text-primary-600 dark:text-primary-400 font-bold">{contact.number}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* First Aid Tips */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-info-600 dark:text-info-400" />
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">First Aid Tips</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {firstAidTips.map((tip, idx) => (
            <div 
              key={idx}
              className="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setActiveTip(activeTip === idx ? null : idx)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-info-100 dark:bg-info-900/30 flex items-center justify-center">
                  <tip.icon className="w-5 h-5 text-info-600 dark:text-info-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-neutral-800 dark:text-neutral-200">{tip.title}</p>
                </div>
                <ChevronRight className={`w-5 h-5 text-neutral-400 transition-transform ${activeTip === idx ? 'rotate-90' : ''}`} />
              </button>
              {activeTip === idx && (
                <div className="px-4 pb-4 border-t border-neutral-200 dark:border-neutral-700">
                  <ol className="mt-3 space-y-2">
                    {tip.steps.map((step, stepIdx) => (
                      <li key={stepIdx} className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                        <span className="w-5 h-5 rounded-full bg-info-100 dark:bg-info-900/30 text-info-600 dark:text-info-400 flex items-center justify-center text-xs font-medium flex-shrink-0">
                          {stepIdx + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Report Form */}
      {showForm && (
        <div className="card border-2 border-danger-200 dark:border-danger-700">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-danger-600 dark:text-danger-400" />
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Report Emergency</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label dark:text-neutral-300">Emergency Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="input dark:input-dark"
                required
              >
                {emergencyTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.icon} {type.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="input-label dark:text-neutral-300">Severity</label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  className="input dark:input-dark"
                  required
                >
                  <option value="low">Low - General Concern</option>
                  <option value="medium">Medium - Needs Attention</option>
                  <option value="high">High - Urgent</option>
                  <option value="critical">Critical - Life Threatening</option>
                </select>
              </div>
              <div>
                <label className="input-label dark:text-neutral-300">Location</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="input dark:input-dark pl-10"
                    placeholder="Your current location"
                  />
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                </div>
              </div>
            </div>

            <div>
              <label className="input-label dark:text-neutral-300">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input dark:input-dark"
                rows="4"
                placeholder="Describe your symptoms in detail..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-danger w-full"
            >
              {submitting ? 'Submitting...' : 'Submit Emergency Report'}
            </button>
          </form>
        </div>
      )}

      {/* Emergency History */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Your Emergency Reports</h2>
        </div>
        {emergencies.length > 0 ? (
          <div className="space-y-4">
            {emergencies.map((emergency) => (
              <div 
                key={emergency.id} 
                className={`p-4 rounded-xl border ${getSeverityColor(emergency.severity)}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-2 ${
                      emergency.severity === 'critical' ? 'bg-danger-500 animate-pulse' :
                      emergency.severity === 'high' ? 'bg-orange-500' :
                      emergency.severity === 'medium' ? 'bg-warning-500' :
                      'bg-success-500'
                    }`}></div>
                    <div>
                      <h3 className="font-semibold capitalize">
                        {emergency.type.replace('-', ' ')}
                      </h3>
                      <p className="text-sm mt-1 opacity-90">{emergency.description}</p>
                      <p className="text-xs mt-2 opacity-75 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        Reported: {new Date(emergency.createdAt).toLocaleString()}
                      </p>
                      {emergency.location && (
                        <p className="text-xs mt-1 opacity-75 flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          {emergency.location}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(emergency.status)}`}>
                    {emergency.status}
                  </span>
                </div>
                {emergency.providerNotes && (
                  <div className="mt-3 pt-3 border-t border-current opacity-75">
                    <p className="text-sm"><strong>Provider Notes:</strong> {emergency.providerNotes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-success-300 dark:text-success-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-200 mb-2">No Emergency Reports</h3>
            <p className="text-neutral-500 dark:text-neutral-400">You haven't submitted any emergency reports.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Emergency;

