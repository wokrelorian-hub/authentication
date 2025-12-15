import LoginForm from './components/LoginForm';

export default function Home() {
  return (
    <main style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      backgroundColor: '#ffffff' // Ensuring white background
    }}>
      <LoginForm />
    </main>
  );
}