import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Video,
  Building,
  Plus,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Bell,
  Star,
  MessageSquare
} from 'lucide-react';

const appointmentTypes = [
  { id: 'checkup', label: 'Prenatal Checkup', icon: User, duration: 30, color: 'bg-primary-500' },
  { id: 'ultrasound', label: 'Ultrasound', icon: Building, duration: 45, color: 'bg-secondary-500' },
  { id: 'consultation', label: 'Doctor Consultation', icon: User, duration: 30, color: 'bg-info-500' },
  { id: 'lab', label: 'Lab Test', icon: Building, duration: 15, color: 'bg-success-500' },
  { id: 'dental', label: 'Dental Checkup', icon: User, duration: 30, color: 'bg-warning-500' },
  { id: 'nutrition', label: 'Nutritionist', icon: User, duration: 45, color: 'bg-danger-500' },
];

const timeSlots = [
  '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
];

const providers = [
  { id: 1, name: 'Dr. Sarah Johnson', specialty: 'Obstetrician', rating: 4.9, image: 'SJ' },
  { id: 2, name: 'Dr. Michael Chen', specialty: 'General Practitioner', rating: 4.8, image: 'MC' },
  { id: 3, name: 'Dr. Emily Williams', specialty: 'Nutritionist', rating: 4.7, image: 'EW' },
];

const Appointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedType, setSelectedType] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    // Simulate loading appointments
    setLoading(false);
    const savedAppointments = localStorage.getItem('appointments');
    if (savedAppointments) {
      setAppointments(JSON.parse(savedAppointments));
    }
  }, [user]);

  const saveAppointment = () => {
    if (!selectedDate || !selectedTime || !selectedType || !selectedProvider) return;

    const newAppointment = {
      id: Date.now(),
      date: selectedDate,
      time: selectedTime,
      type: selectedType,
      provider: selectedProvider,
      notes,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    const updatedAppointments = [newAppointment, ...appointments];
    setAppointments(updatedAppointments);
    localStorage.setItem('appointments', JSON.stringify(updatedAppointments));

    // Reset form
    setSelectedDate('');
    setSelectedTime('');
    setSelectedType(null);
    setSelectedProvider(null);
    setNotes('');
    setShowForm(false);
  };

  const cancelAppointment = (id) => {
    const updated = appointments.map(apt => 
      apt.id === id ? { ...apt, status: 'cancelled' } : apt
    );
    setAppointments(updated);
    localStorage.setItem('appointments', JSON.stringify(updated));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return { color: 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400', icon: CheckCircle };
      case 'pending':
        return { color: 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400', icon: Clock };
      case 'cancelled':
        return { color: 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400', icon: XCircle };
      case 'completed':
        return { color: 'bg-info-100 text-info-700 dark:bg-info-900/30 dark:text-info-400', icon: CheckCircle };
      default:
        return { color: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400', icon: AlertCircle };
    }
  };

  const upcomingAppointments = appointments.filter(apt => 
    apt.status !== 'cancelled' && new Date(apt.date) >= new Date()
  );
  const pastAppointments = appointments.filter(apt => 
    apt.status === 'completed' || new Date(apt.date) < new Date()
  );
  const cancelledAppointments = appointments.filter(apt => apt.status === 'cancelled');

  const displayedAppointments = activeTab === 'upcoming' 
    ? upcomingAppointments 
    : activeTab === 'past' 
      ? pastAppointments 
      : cancelledAppointments;

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
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Appointments
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary-glow"
        >
          {showForm ? 'Cancel' : 'Book Appointment'}
        </button>
      </div>

      {/* Book Appointment Form */}
      {showForm && (
        <div className="card animate-scale-in">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Book New Appointment
          </h2>

          {/* Step 1: Select Type */}
          <div className="mb-4">
            <label className="input-label dark:text-neutral-300 mb-3">Appointment Type</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {appointmentTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
                    selectedType?.id === type.id
                      ? `${type.color} text-white shadow-lg`
                      : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  <type.icon className="w-6 h-6" />
                  <span className="text-xs font-medium text-center">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Select Provider */}
          <div className="mb-4">
            <label className="input-label dark:text-neutral-300 mb-3">Select Provider</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {providers.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => setSelectedProvider(provider)}
                  className={`flex items-center gap-3 p-4 rounded-xl transition-all ${
                    selectedProvider?.id === provider.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    selectedProvider?.id === provider.id
                      ? 'bg-white/20 text-white'
                      : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                  }`}>
                    {provider.image}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">{provider.name}</p>
                    <p className={`text-xs ${
                      selectedProvider?.id === provider.id 
                        ? 'text-white/80' 
                        : 'text-neutral-500 dark:text-neutral-400'
                    }`}>
                      {provider.specialty}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className={`w-3 h-3 ${
                        selectedProvider?.id === provider.id 
                          ? 'text-warning-300' 
                          : 'text-warning-500'
                      }`} />
                      <span className={`text-xs ${
                        selectedProvider?.id === provider.id 
                          ? 'text-white/80' 
                          : 'text-neutral-500 dark:text-neutral-400'
                      }`}>
                        {provider.rating}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Select Date */}
          <div className="mb-4">
            <label className="input-label dark:text-neutral-300">Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="input dark:input-dark"
            />
          </div>

          {/* Step 4: Select Time */}
          <div className="mb-4">
            <label className="input-label dark:text-neutral-300 mb-3">Select Time</label>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedTime === time
                      ? 'bg-primary-500 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="input-label dark:text-neutral-300">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input dark:input-dark"
              rows="2"
              placeholder="Any specific concerns or questions..."
            />
          </div>

          {/* Summary */}
          {selectedDate && selectedTime && selectedType && selectedProvider && (
            <div className="mb-4 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl border border-primary-100 dark:border-primary-500/20">
              <h4 className="font-medium text-primary-800 dark:text-primary-300 mb-2">Appointment Summary</h4>
              <div className="text-sm text-primary-700 dark:text-primary-400 space-y-1">
                <p><strong>Type:</strong> {selectedType.label}</p>
                <p><strong>Provider:</strong> {selectedProvider.name}</p>
                <p><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><strong>Time:</strong> {selectedTime}</p>
                <p><strong>Duration:</strong> {selectedType.duration} minutes</p>
              </div>
            </div>
          )}

          <button
            onClick={saveAppointment}
            disabled={!selectedDate || !selectedTime || !selectedType || !selectedProvider}
            className="btn-primary-glow w-full"
          >
            Confirm Appointment
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {[
          { id: 'upcoming', label: 'Upcoming', count: upcomingAppointments.length },
          { id: 'past', label: 'Past', count: pastAppointments.length },
          { id: 'cancelled', label: 'Cancelled', count: cancelledAppointments.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg shadow-primary-500/30'
                : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700'
            }`}
          >
            {tab.label}
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              activeTab === tab.id 
                ? 'bg-white/20 text-white' 
                : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {displayedAppointments.length > 0 ? (
        <div className="space-y-4">
          {displayedAppointments.map((appointment) => {
            const type = appointmentTypes.find(t => t.id === appointment.type);
            const status = getStatusBadge(appointment.status);
            const StatusIcon = status.icon;

            return (
              <div 
                key={appointment.id} 
                className="card-hover flex flex-col md:flex-row md:items-center gap-4"
              >
                {/* Date Box */}
                <div className="flex-shrink-0">
                  <div className={`w-16 h-16 rounded-xl ${type?.color} flex flex-col items-center justify-center text-white shadow-lg`}>
                    <span className="text-xs font-medium uppercase">
                      {new Date(appointment.date).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-xl font-bold">
                      {new Date(appointment.date).getDate()}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {type?.label}
                      </h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {appointment.provider.name} • {appointment.provider.specialty}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {appointment.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'long' })}
                        </span>
                      </div>
                    </div>
                    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {appointment.status}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {appointment.status !== 'cancelled' && appointment.status !== 'completed' && new Date(appointment.date) >= new Date() && (
                  <div className="flex gap-2">
                    <button className="btn-primary-glow btn-sm">
                      <Bell className="w-4 h-4 mr-1" />
                      Remind
                    </button>
                    <button 
                      onClick={() => cancelAppointment(appointment.id)}
                      className="btn-ghost btn-sm text-danger-600 dark:text-danger-400"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 flex items-center justify-center">
            <Calendar className="w-10 h-10 text-primary-500 dark:text-primary-400" />
          </div>
          <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-200 mb-2">
            No {activeTab} Appointments
          </h3>
          <p className="text-neutral-500 dark:text-neutral-400 mb-4">
            {activeTab === 'upcoming' 
              ? 'Book an appointment to get started'
              : `No ${activeTab} appointments to show`
            }
          </p>
          {activeTab === 'upcoming' && (
            <button onClick={() => setShowForm(true)} className="btn-primary-glow inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Book Appointment
            </button>
          )}
        </div>
      )}

      {/* Quick Book Widget */}
      {!showForm && (
        <div className="card bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1">Need to see a doctor?</h3>
              <p className="text-primary-100 text-sm">Book your next appointment in just a few clicks</p>
            </div>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-white text-primary-600 px-4 py-2 rounded-xl font-medium hover:bg-primary-50 transition-colors flex items-center gap-2"
            >
              Book Now
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;

