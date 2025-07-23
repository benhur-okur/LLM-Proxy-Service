const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Login() {
  return (
    <div>
      <h1>Login Sayfası</h1>
      <p>Google login butonuna buradan yönlendirme yapacağız.</p>
      <a href={`${BACKEND_URL}/login/google`}>
        <button>Google ile Giriş Yap</button>
      </a>
    </div>
  );
}
