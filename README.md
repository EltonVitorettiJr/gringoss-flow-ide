<div align="center">

# 💈 Agenda Rules IDE

**Um ambiente visual para configurar regras de agendamento sem dor de cabeça.**

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Figma](https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white)

*Projeto de Extensão · Ciências da Computação EAD · UNISAGRADO*

</div>

---

## 📌 Sobre o projeto

Em muitos salões e barbearias, o controle de horários e a definição de disponibilidade ainda são feitos **manualmente via WhatsApp**. O resultado: choques de horário e muito tempo gasto com atendimento.

A **Agenda Rules IDE** é uma IDE web onde o gestor configura, de forma visual, as regras da agenda: janelas de horário, duração de cada serviço e restrições/bloqueios. A ideia é **automatizar a grade de horários** e **reduzir conflitos na agenda**.

## 🤝 Instituição parceira

| | |
|---|---|
| **Parceiro** | Barbearia Gringoss |
| **Segmento** | Beleza e estética |
| **Público beneficiado** | O gestor do salão e seus clientes |

## 🎯 Objetivo

Desenvolver um ambiente visual (IDE) de configuração de regras de agendamento que permita parametrizar:

- 🕒 **Disponibilidade** de horários
- ⏱️ **Tempo de execução** de cada serviço
- 🚫 **Restrições e bloqueios** de agenda

## ✨ Funcionalidades previstas

- [ ] Configuração visual de janelas de horário padronizadas
- [ ] Cadastro de serviços com duração personalizada
- [ ] Regras de bloqueio e restrição de horários
- [ ] Simulação da agenda a partir das regras criadas
- [ ] Geração automática da grade de horários
- [ ] Detecção e redução de conflitos

## 🚀 Como rodar localmente

```bash
# Clone o repositório
git clone https://github.com/<seu-usuario>/<nome-do-repositorio>.git

# Entre na pasta
cd <nome-do-repositorio>

# Instale as dependências
npm install

# Inicie o ambiente de desenvolvimento
npm run dev
```

> 🔐 Crie um arquivo `.env` com as credenciais do Supabase:
>
> ```env
> VITE_SUPABASE_URL=sua_url
> VITE_SUPABASE_ANON_KEY=sua_chave
> ```

## 👥 Equipe

| Nome | Papel |
|---|---|
| Elton Antônio Vitoretti Junior | Contato com o parceiro, validação e relatório final |
| Gabriela Vitória da Silva | Front-end e prototipação |
| Demais integrantes | Modelagem, desenvolvimento da interface e lógica de regras |


## 🏫 Instituição de ensino

Projeto desenvolvido para a disciplina de extensão dos **Cursos EaD da Área de Tecnologia — UNISAGRADO**.
