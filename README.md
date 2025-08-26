# 💊 Pill Splitter

An interactive pill splitter application built with React, TypeScript, and Tailwind CSS.

## 🎯 Project Overview

This application is a virtual pill splitter tool that allows users to:

- Create pills by dragging and dropping
- Split pills using mouse clicks
- Move pills around the canvas
- Create pills of various sizes and colors

## ✨ Features

### 🖱️ Pill Creation

- Drag in empty space to create new pills
- Each pill is generated with a random color
- Minimum size: 40px × 40px
- Rounded corner pill shape

### ✂️ Pill Splitting

- Click on any pill to split it
- Supports both vertical and horizontal splitting
- Cross-shaped splitting (into 4 pieces) possible
- Minimum split size: 20px
- Smart corner management

### 🎮 Interactive UI

- Real-time crosshair guide
- Drag and drop pill movement
- Drawing preview
- Smooth animations

## 🛠️ Technology Stack

### Frontend

- **React 19.1.1** - UI Framework
- **TypeScript** - Type Safety
- **Tailwind CSS 4.1.11** - Styling
- **Vite 7.1.0** - Build Tool

### Development Tools

- **ESLint** - Code linting
- **TypeScript ESLint** - TypeScript-specific rules
- **Vite React Plugin** - Hot reload

## 🎮 How to Use

### 1. Creating Pills

- Hold down mouse button in empty space
- Drag to determine size
- Release mouse button

### 2. Splitting Pills

- Click where you want to split
- Use crosshair guide for precise positioning

### 3. Moving Pills

- Click and hold on a pill
- Drag to desired location

### Performance Optimizations

- Implement React.memo
- Virtual scrolling for large numbers of pills
- Canvas rendering for performance improvements

**Made with ❤️ using React + TypeScript + Tailwind CSS**
