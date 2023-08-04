# Multiplayer Desmos

![preview img](./static/preview.png)

It's [Desmos](https://desmos.com/calculator/), but multiplayer.

## Purpose

Multiplayer Desmos was created as a tool for math tutors on [Schoolhouse.world](https://schoolhouse.world/), a platform that provides free peer tutoring.

My hypothesis is that if students are given a way to interact in an online tutoring session beyond language (talking, chatting), then tutors can more effectively create an active learning environment because students can act instead of replying "I understand."

## Engineering

I used the Desmos API for the graph, [Y.js](https://github.com/yjs/yjs) as a peer-to-peer CRDT, and I hosted a signaling server myself.

The frontend is created with SvelteKit and Tailwind CSS.