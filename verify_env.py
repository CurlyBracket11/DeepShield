import sys
import torch

def check_environment():
    print("=" * 50)
    print("DEEPSHIELD-AI: ENVIRONMENT & HARDWARE CHECK")
    print("=" * 50)
    
    # Python Version
    print(f"[+] Python Version: {sys.version.split()[0]}")
    
    # PyTorch Version
    print(f"[+] PyTorch Version: {torch.__version__}")
    
    # GPU / CUDA Availability
    cuda_available = torch.cuda.is_available()
    print(f"[+] CUDA / GPU Available: {cuda_available}")
    
    if cuda_available:
        print(f"[+] GPU Device Name: {torch.cuda.get_device_name(0)}")
        print(f"[+] Device Count: {torch.cuda.device_count()}")
        print(f"[+] VRAM Total: {torch.cuda.get_device_properties(0).total_memory / (1024**3):.2f} GB")
    else:
        print("[!] WARNING: CUDA is not available. PyTorch will run on CPU.")
        
    print("=" * 50)

if __name__ == "__main__":
    check_environment()