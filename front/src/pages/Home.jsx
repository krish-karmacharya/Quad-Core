// import NavBar from '../components/Navbar';
import UploadForm from '../components/UploadForm';

export default function Home() {
  return (
    <div>
      {/* <NavBar /> */}
      <main className="p-6">
        <h1 className="text-2xl mb-4">Report an issue</h1>
        <UploadForm />
      </main>
    </div>
  );
}
