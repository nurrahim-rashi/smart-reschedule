# Image untuk Hugging Face Spaces (Docker). Spaces menjalankan container
# sebagai user 1000 dan meneruskan port 7860.
FROM python:3.13-slim

RUN useradd -m -u 1000 user
USER user

ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    HF_HOME=/home/user/.cache/huggingface \
    PYTHONUNBUFFERED=1 \
    TF_CPP_MIN_LOG_LEVEL=2

WORKDIR $HOME/app

# PyTorch versi CPU dipasang dulu supaya sentence-transformers tidak
# menarik versi CUDA yang ukurannya beberapa GB
COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir --user torch --index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir --user -r requirements.txt

RUN python -m nltk.downloader -d $HOME/nltk_data stopwords

COPY --chown=user . .

# Index FAQ dibangun saat build (sekaligus mengunduh model embedding)
RUN python rag/build_index.py

EXPOSE 7860

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
