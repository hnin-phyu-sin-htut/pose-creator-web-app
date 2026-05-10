# Pose Creator Web Application

An AI-powered web application that generates creative pose and character images from text prompts using Hugging Face image generation models.

*This project uses:*

*Frontend: React + TypeScript + Vite + TailwindCSS*

*Backend: Spring Boot + JWT Authentication + PostgreSQL*

*AI Service: FastAPI + Hugging Face Inference API*

## Features

- User authentication with JWT
- AI image generation from prompts
- Multiple image styles
- Generation history tracking
- Fast React frontend with Vite
- PostgreSQL database integration
- Separate AI microservice using FastAPI
- Hugging Face FLUX model integration

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- DaisyUI
- Axios
- React Router

### Backend

- Spring Boot 4
- Spring Security
- Spring Data JPA
- JWT Authentication
- PostgreSQL
- Maven

### AI Service

- FastAPI
- Hugging Face Inference API
- Python
- Uvicorn

## Backend Setup (Spring Boot)

- Requirements
- Java 25
- Maven
- PostgreSQL

## Configure PostgreSQL

psql -U postgres -c "CREATE DATABASE pose_db;"

psql -U postgres -c "CREATE USER pose WITH PASSWORD 'pose';"

psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE pose_db TO pose;"

## AI Service Setup (FastAPI)

- Install Dependencies

- python -m venv .venv

- pip install -r requirements.txt

## Create .env

HF_TOKEN=your_huggingface_token

HF_MODEL=black-forest-labs/FLUX.1-schnell

## Author

Hnin Phyu Sin Htut
