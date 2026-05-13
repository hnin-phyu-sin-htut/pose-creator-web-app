# Pose Creator Web Application

An AI-powered web application that generates creative pose and character images from text prompts using Hugging Face image generation models.

*This project uses:*

*Frontend: React + TypeScript + Vite + TailwindCSS*

*Backend: Spring Boot + JWT Authentication + PostgreSQL*

*AI Service: FastAPI + Pollinations AI API + Python + Uvicorn*

*Image Model: Flux-Realism (via Pollinations AI)*

## Features

- User authentication with JWT
- AI image generation from prompts
- Multiple image styles
- Generation history tracking
- Fast React frontend with Vite
- PostgreSQL database integration
- Separate AI microservice using FastAPI
- Pollinations AI integration using Flux-Realism model

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
- Pollinations AI API
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

## Author

Hnin Phyu Sin Htut
