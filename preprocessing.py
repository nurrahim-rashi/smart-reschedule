import re

from nltk.corpus import stopwords
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory


# =========================
# INITIALIZATION
# =========================

factory = StemmerFactory()
stemmer = factory.create_stemmer()

stopwords_indonesia = set(
    stopwords.words("indonesian")
)


# =========================
# TEXT PREPROCESSING
# =========================

def clean_text(text):
    """
    Preprocess customer message.

    Steps:
    1. Lowercase
    2. Remove URL
    3. Remove mention
    4. Remove hashtag
    5. Remove punctuation & numbers
    6. Remove extra whitespace
    7. Stopword removal
    8. Stemming
    """

    text = str(text)

    # lowercase
    text = text.lower()

    # remove url
    text = re.sub(r"http\S+", "", text)

    # remove www
    text = re.sub(r"www\S+", "", text)

    # remove mention
    text = re.sub(r"@\w+", "", text)

    # remove hashtag
    text = re.sub(r"#\w+", "", text)

    # keep alphabet only
    text = re.sub(
        r"[^a-zA-Z\s]",
        " ",
        text
    )

    # remove extra spaces
    text = re.sub(
        r"\s+",
        " ",
        text
    )

    words = text.split()

    # remove stopwords
    words = [
        word
        for word in words
        if word not in stopwords_indonesia
    ]

    # stemming
    words = [
        stemmer.stem(word)
        for word in words
    ]

    return " ".join(words).strip()