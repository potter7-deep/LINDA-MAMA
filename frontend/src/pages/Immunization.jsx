import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Baby, 
  Calendar, 
  Syringe, 
  CheckCircle, 
  Clock,
  ChevronRight,
  Plus,
  Shield,
  Activity
} from 'lucide-react';

const Immunization = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [standardSchedule, setStandardSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [formData, setFormData] = useState({
    childName: '',
    dateOfBirth: '',
    vaccines: '[]',
    nextAppointment: '',
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [schedulesRes, standardRes] = await Promise.all([
        api.get(`/immunization/${user.id}`),
        api.get('/immunization/standards/schedule'),
      ]);
      // Data is already extracted by the API interceptor
      setSchedules(schedulesRes);
      setStandardSchedule(standardRes);
      if (schedulesRes.length > 0) {
        setSelectedChild(schedulesRes[0]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/immunization', {
        userId: user.id,
        ...formData,
      });
      setShowForm(false);
      setFormData({
        childName: '',
        dateOfBirth: '',
        vaccines: '[]',
        nextAppointment: '',
      });
      fetchData();
    } catch (error) {
      console.error('Error creating schedule:', error);
    }
  };

  const getVaccinesDue = (dateOfBirth) => {
    if (!dateOfBirth) return [];
    const birth = new Date(dateOfBirth);
    const today = new Date();
    const ageInMonths = Math.floor((today - birth) / (1000 * 60 * 60 * 24 * 30));
    
    return standardSchedule.filter(vaccine => {
      let dueMonth = 0;
      if (vaccine.due === 'Birth') dueMonth = 0;
      else if (vaccine.due.includes('weeks')) dueMonth = parseInt(vaccine.due) / 4;
      else if (vaccine.due.includes('months')) dueMonth = parseInt(vaccine.due);
      else if (vaccine.due.includes('years')) dueMonth = parseInt(vaccine.due) * 12;
      return dueMonth <= ageInMonths;
    });
  };

  const getProgress = (dateOfBirth) => {
    const due = getVaccinesDue(dateOfBirth);
    const total = standardSchedule.slice(0, 12).length;
    return Math.round((due.length / total) * 100);
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
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Immunization Schedule</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary-glow"
        >
          {showForm ? 'Cancel' : 'Add Child'}
        </button>
      </div>

      {/* Add Child Form */}
      {showForm && (
        <div className="card">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Add Child Immunization Schedule</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="input-label dark:text-neutral-300">Child's Name</label>
                <input
                  type="text"
                  value={formData.childName}
                  onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
                  className="input dark:input-dark"
                  required
                />
              </div>
              <div>
                <label className="input-label dark:text-neutral-300">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="input dark:input-dark"
                  required
                />
              </div>
            </div>
            <div>
              <label className="input-label dark:text-neutral-300">Next Appointment</label>
              <input
                type="date"
                value={formData.nextAppointment}
                onChange={(e) => setFormData({ ...formData, nextAppointment: e.target.value })}
                className="input dark:input-dark"
              />
            </div>
            <button type="submit" className="btn-primary-glow">Save Schedule</button>
          </form>
        </div>
      )}

      {/* Child Cards */}
      {schedules.length > 0 ? (
        <div className="space-y-6">
          {/* Child Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {schedules.map((schedule, idx) => (
              <button
                key={schedule.id}
                onClick={() => setSelectedChild(schedule)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl whitespace-nowrap transition-all ${
                  selectedChild?.id === schedule.id
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-700'
                }`}
              >
                <Baby className="w-5 h-5" />
                <span className="font-medium">{schedule.childName}</span>
                <span className="text-sm opacity-80">
                  {getProgress(schedule.dateOfBirth)}%
                </span>
              </button>
            ))}
          </div>

          {/* Selected Child Details */}
          {selectedChild && (
            <div className="card">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center shadow-lg">
                    <Baby className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{selectedChild.childName}</h2>
                    <p className="text-neutral-500 dark:text-neutral-400">
                      Born: {new Date(selectedChild.dateOfBirth).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {/* Progress Circle */}
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="transparent"
                        className="text-neutral-200 dark:text-neutral-700"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="transparent"
                        strokeLinecap="round"
                        className="text-primary-500"
                        style={{
                          strokeDasharray: 176,
                          strokeDashoffset: 176 - (176 * getProgress(selectedChild.dateOfBirth)) / 100,
                        }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                        {getProgress(selectedChild.dateOfBirth)}%
                      </span>
                    </div>
                  </div>
                  {selectedChild.nextAppointment && (
                    <div className="text-right">
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">Next Appointment</p>
                      <p className="font-semibold text-primary-600 dark:text-primary-400">
                        {new Date(selectedChild.nextAppointment).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Vaccination Progress */}
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-2">
                  <Syringe className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  Vaccination Progress
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {getVaccinesDue(selectedChild.dateOfBirth).map((vaccine, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3 rounded-xl border ${
                        idx < 5 
                          ? 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-700' 
                          : 'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className={`w-4 h-4 ${idx < 5 ? 'text-success-500' : 'text-neutral-400'}`} />
                          <span className="font-medium text-neutral-800 dark:text-neutral-200 text-sm">{vaccine.name}</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          idx < 5 
                            ? 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400' 
                            : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                        }`}>
                          {vaccine.due}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{vaccine.protection}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <Baby className="w-10 h-10 text-neutral-400" />
          </div>
          <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-200 mb-2">No immunization schedules yet</h3>
          <p className="text-neutral-500 dark:text-neutral-400 mb-4">Add your child's information to track vaccinations</p>
          <button onClick={() => setShowForm(true)} className="btn-primary-glow inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Child
          </button>
        </div>
      )}

      {/* Standard Schedule Reference */}
      <div className="card">
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
          Standard Immunization Schedule
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-800/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-neutral-600 dark:text-neutral-400">Vaccine</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600 dark:text-neutral-400">Due</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600 dark:text-neutral-400">Dose</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600 dark:text-neutral-400">Protection</th>
              </tr>
            </thead>
            <tbody>
              {standardSchedule.slice(0, 15).map((vaccine, idx) => (
                <tr key={idx} className="border-t border-neutral-100 dark:border-neutral-800">
                  <td className="px-4 py-3 text-neutral-800 dark:text-neutral-200">{vaccine.name}</td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{vaccine.due}</td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">{vaccine.dose}</td>
                  <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">{vaccine.protection}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-4">
          Showing first 15 vaccines. Full schedule available upon request.
        </p>
      </div>
    </div>
  );
};

export default Immunization;

