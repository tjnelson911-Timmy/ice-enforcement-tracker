import AddIncidentForm from './add-incident-form';

export default function AddIncidentPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Add New Incident</h1>
        <AddIncidentForm />
      </div>
    </div>
  );
}
