import os
import signal
import subprocess
import sys
import time
import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parent


SERVICES = [
    {
        "name": "Stage 1 Backend (Resume Analyzer)",
        "cwd": ROOT / "Resume_Analyzer" / "server",
        "kind": "backend",
        "port": "5000",
    },
    {
        "name": "Stage 2 Backend (GitHub Scanner)",
        "cwd": ROOT / "GitHub_scanner" / "server",
        "kind": "backend",
        "port": "8001",
    },
    {
        "name": "Stage 3 Backend (Challenge)",
        "cwd": ROOT / "Challenge" / "server",
        "kind": "backend",
        "port": "8002",
    },
    {
        "name": "Stage 5 Backend (Certificate)",
        "cwd": ROOT / "Certificate" / "server",
        "kind": "backend",
        "port": "8003",
    },
    {
        "name": "Frontend (React)",
        "cwd": ROOT / "Resume_Analyzer" / "client",
        "kind": "frontend",
        "cmd": ["npm", "start"],
    },
]


def resolve_backend_python(cwd: Path) -> str:
    if os.name == "nt":
        venv_python = cwd / "venv" / "Scripts" / "python.exe"
    else:
        venv_python = cwd / "venv" / "bin" / "python"

    if venv_python.exists():
        return str(venv_python)

    print(f"[WARN] No venv python found for {cwd}. Falling back to current interpreter.")
    return sys.executable


def python_has_module(python_exec: str, module_name: str) -> bool:
    try:
        result = subprocess.run(
            [python_exec, "-c", f"import {module_name}"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=False,
        )
        return result.returncode == 0
    except Exception:
        return False


def resolve_npm_command() -> str:
    # On Windows, npm is usually npm.cmd
    candidates = ["npm.cmd", "npm"] if os.name == "nt" else ["npm"]
    for candidate in candidates:
        found = shutil.which(candidate)
        if found:
            return found
    raise FileNotFoundError("npm was not found in PATH. Install Node.js and ensure npm is available.")


def build_command(service: dict) -> list[str]:
    if service.get("kind") == "backend":
        venv_python = resolve_backend_python(service["cwd"])
        python_exec = venv_python
        if not python_has_module(venv_python, "uvicorn"):
            print(
                f"[WARN] uvicorn not available in {venv_python}. "
                "Falling back to current interpreter."
            )
            python_exec = sys.executable
        if not python_has_module(python_exec, "uvicorn"):
            raise RuntimeError(
                f"uvicorn is not installed for selected interpreter: {python_exec}. "
                f"Install it in {service['cwd']}\\venv or globally."
            )
        return [
            python_exec,
            "-m",
            "uvicorn",
            "main:app",
            "--reload",
            "--host",
            "0.0.0.0",
            "--port",
            service["port"],
        ]
    if service.get("kind") == "frontend":
        npm_exec = resolve_npm_command()
        return [npm_exec, "start"]
    return service["cmd"]


def start_service(service):
    cwd = service["cwd"]
    if not cwd.exists():
        raise FileNotFoundError(f"Directory not found: {cwd}")

    cmd = build_command(service)
    print(f"[START] {service['name']}")
    process = subprocess.Popen(
        cmd,
        cwd=str(cwd),
        env=os.environ.copy(),
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if os.name == "nt" else 0,
    )
    return process


def stop_process(process):
    if process.poll() is not None:
        return
    try:
        if os.name == "nt":
            process.send_signal(signal.CTRL_BREAK_EVENT)
            time.sleep(0.5)
        else:
            process.terminate()
    except Exception:
        pass

    if process.poll() is None:
        process.terminate()
    try:
        process.wait(timeout=5)
    except subprocess.TimeoutExpired:
        process.kill()


def main():
    print("Starting Talent full stack...")
    print("Frontend: http://localhost:3000")
    print("Stage 1 API: http://localhost:5000")
    print("Stage 2 API: http://localhost:8001")
    print("Stage 3 API: http://localhost:8002")
    print("Stage 5 API: http://localhost:8003")
    print("Press Ctrl+C to stop everything.\n")

    processes = []
    try:
        for service in SERVICES:
            try:
                process = start_service(service)
                processes.append(process)
                time.sleep(0.5)
            except Exception as error:
                raise RuntimeError(f"Failed to start {service['name']}: {error}") from error

        while True:
            for process, service in zip(processes, SERVICES):
                if process.poll() is not None:
                    raise RuntimeError(f"{service['name']} exited unexpectedly.")
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping all services...")
    except Exception as error:
        print(f"\n[ERROR] {error}")
    finally:
        for process in processes:
            stop_process(process)
        print("All services stopped.")


if __name__ == "__main__":
    main()
