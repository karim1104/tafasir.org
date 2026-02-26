from sqlalchemy import Column, Integer, String, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Language(Base):
    __tablename__ = 'languages'

    id = Column(Integer, primary_key=True, index=True)
    language_number = Column(Integer, unique=True, nullable=False)
    name = Column(String, nullable=False)

    texts = relationship("TafsirText", back_populates="language")


class Madhab(Base):
    __tablename__ = 'madhabs'

    id = Column(Integer, primary_key=True, index=True)
    madhab_number = Column(Integer, unique=True, nullable=False)
    name = Column(String, nullable=False)

    texts = relationship("TafsirText", back_populates="madhab")


class Sura(Base):
    __tablename__ = 'suras'

    id = Column(Integer, primary_key=True, index=True)
    sura_number = Column(Integer, unique=True, nullable=False)
    name = Column(String, nullable=False)

    texts = relationship("TafsirText", back_populates="sura")


class Ayah(Base):
    __tablename__ = 'ayahs'

    id = Column(Integer, primary_key=True, index=True)
    sura_number = Column(Integer, ForeignKey('suras.sura_number'), nullable=False)
    ayah_number = Column(Integer, nullable=False)
    text = Column(Text, nullable=False)
    language_id = Column(Integer, ForeignKey('languages.id'), nullable=False)
    text_with_tashkeel = Column(Text)
    text_english = Column(Text)

    __table_args__ = (UniqueConstraint('sura_number', 'ayah_number', name='_sura_ayah_uc'),)


class Tafsir(Base):
    __tablename__ = 'tafsirs'

    id = Column(Integer, primary_key=True, index=True)
    tafsir_number = Column(Integer, unique=True, nullable=False)
    name = Column(String, nullable=False)
    language_number = Column(Integer, ForeignKey('languages.language_number'), nullable=False)
    madhab_number = Column(Integer, ForeignKey('madhabs.madhab_number'), nullable=False)
    author = Column(String, nullable=False)
    author_death = Column(Integer)  # Add this field
    book_name = Column(String, nullable=False)
    description = Column(Text)  # Add this field

    texts = relationship("TafsirText", back_populates="tafsir")



class TafsirText(Base):
    __tablename__ = 'tafsir_texts'

    id = Column(Integer, primary_key=True, index=True)
    tafsir_number = Column(Integer, ForeignKey('tafsirs.tafsir_number'), nullable=False)
    sura_number = Column(Integer, ForeignKey('suras.sura_number'), nullable=False)
    ayah_number = Column(Integer, nullable=False)
    text = Column(Text, nullable=False)
    language_number = Column(Integer, ForeignKey('languages.language_number'), nullable=False)
    madhab_number = Column(Integer, ForeignKey('madhabs.madhab_number'), nullable=False)

    tafsir = relationship("Tafsir", back_populates="texts")
    sura = relationship("Sura", back_populates="texts")
    language = relationship("Language", back_populates="texts")
    madhab = relationship("Madhab", back_populates="texts")

    __table_args__ = (UniqueConstraint('tafsir_number', 'sura_number', 'ayah_number', name='_tafsir_sura_ayah_uc'),)
