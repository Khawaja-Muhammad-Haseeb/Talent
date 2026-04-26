import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CertificateCard from "../components/CertificateCard";
import VerifyLookup from "../components/VerifyLookup";

function VerifyPage() {
  const { credentialId } = useParams();
  const [loading, setLoading] = useState(true);
  const [found, setFound] = useState(false);
  const [message, setMessage] = useState("");
  const [credential, setCredential] = useState(null);

  useEffect(() => {
    let active = true;
    const run = async () => {
      setLoading(true);
      setFound(false);
      setMessage("");
      setCredential(null);
      try {
        const response = await fetch(
          `http://localhost:8003/api/stage5/verify/${encodeURIComponent(credentialId)}`
        );
        const payload = await response.json();
        if (!active) return;
        if (payload.found) {
          setFound(true);
          setCredential(payload.credential);
        } else {
          setFound(false);
          setMessage(payload.message || "Credential not found. The ID may be incorrect.");
        }
      } catch (error) {
        if (!active) return;
        setMessage("Credential not found. The ID may be incorrect.");
      } finally {
        if (active) setLoading(false);
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [credentialId]);

  return (
    <main className="app" style={{ background: "#f8fafc" }}>
      <section className="container">
        {loading ? (
          <section className="card">
            <h3>Looking up credential...</h3>
          </section>
        ) : null}

        {!loading && found ? (
          <>
            <section className="card" style={{ background: "#ecfdf3", borderColor: "#abefc6" }}>
              <strong style={{ color: "#067647" }}>This credential is verified and authentic</strong>
            </section>
            <CertificateCard credential={credential} />
            {credential?.ipfsUrl ? (
              <section className="card">
                <a href={credential.ipfsUrl} target="_blank" rel="noreferrer">
                  View original on IPFS →
                </a>
              </section>
            ) : null}
          </>
        ) : null}

        {!loading && !found ? (
          <>
            <section className="card" style={{ background: "#fef3f2", borderColor: "#fecdca" }}>
              <strong style={{ color: "#b42318" }}>Credential not found</strong>
              <p>{message}</p>
            </section>
            <VerifyLookup />
          </>
        ) : null}
      </section>
    </main>
  );
}

export default VerifyPage;
