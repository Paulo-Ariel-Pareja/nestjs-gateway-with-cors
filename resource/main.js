const app = new Vue({
  el: '#app',
  data: {
    title: 'Emitir notificaciones "push"',
    text: '',
    sender: 'usuario1',
    destination: 'usuario1',
    messages: [],
    socket: null,
    userSender: 'usuario1',
    userDestination: 'usuario1',
    connectionStatus: false,
    showButtonConnect: "enabled",
    showButtonDisconnect: "enabled",
    connectionCreated: null,
    rooms: {
      general: false,
      roomA: false,
      roomB: false,
      roomC: false,
      roomD: false,
    },
    usersList: [
      "usuario1",
      "usuario2",
      "usuario3",
      "usuario4",
      "usuario5"
    ]
  },
  methods: {
    socketDisconnect(){
      this.socket.disconnect();
    },
    socketConnect() {
      this.socket = io('http://localhost:3420/realtime', {
        transportOptions: {
          withCredentials: true,
          polling: {
            extraHeaders: {
              Authorization: this.userDestination,

              methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
              withCredentials: true,
              cors: {

                methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
                withCredentials: true
              }
            }
          },
          cors: {

            methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
            withCredentials: true
          }
        },
        cors: {

          methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
          withCredentials: true,
        }
      });
      this.socket.on('msgToClient', (message) => {
        if (message) {
          this.receivedMessage(message)
        } else {
          this.messages = []
        }
      });

      this.socket.on('connect', () => {
        // this.check();
      });

      this.socket.on('joinedRoom', (room) => {
        this.rooms[room] = true;
      });

      this.socket.on('leftRoomServer', (room) => {
        this.rooms[room] = false;
      });
    },
    connectar() {
      this.connectionStatus = !(this.connectionStatus)
      if (this.connectionStatus) {
        this.socketConnect()
        this.socket.emit('joinRoom', this.userDestination);
        const message = {
          uuid: this.userDestination
        };
        this.socket.emit('msgToServer', message);
      } else {
        this.socket.emit('leaveRoom', this.userDestination);
        this.socketDisconnect()
        this.messages = [];
      }
    },
    onChangeUserSender(event) {
      this.userSender = event.target.value;
      if (this.connectionStatus) {
        this.socket.emit('leaveRoom', this.userSender);
        this.socket.emit('joinRoom', this.userSender);
/*         const message = {
          uuid: this.userSender
        };
        this.socket.emit('msgToServer', message); */
      }
    },
    onChangeUserDestination(event) {
      this.userDestination = event.target.value;
      const message = {
        uuid: this.userDestination
      };
      this.socket.emit('msgToServer', message);
    },
    sendMessage() {
      if (this.validateInput() && this.connectionStatus) {
        console.log(`enviado datos a ${this.userDestination}`)
        const message = {
          uuid: this.userDestination,
          messages: [{ message: this.text }],
        };
        this.socket.emit('msgToServer', message);
        this.text = '';
      }
    },
    receivedMessage(message) {
      const mensajes = [];
      message.messages.forEach(element => {
        mensajes.push(element.message)
      });
      this.messages = mensajes;
    },
    validateInput() {
      return this.text.length > 0
    },
  },
  computed: {
    isMemberOfActiveRoom() {
      return this.rooms[this.userSender];
    }
  },
  created() {
    /* const numeroServidor= Math.floor(Math.random() * 99999999999999) + 1;
    this.connectionCreated = true;
    this.socket = io('http://localhost:3420/realtime', {
      transportOptions: {
        withCredentials: true,
        polling: {
          extraHeaders: {
            Authorization: numeroServidor,

            methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
            withCredentials: true,
            cors: {

              methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
              withCredentials: true
            }
          }
        },
        cors: {

          methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
          withCredentials: true
        }
      },
      cors: {

        methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
        withCredentials: true,
      }
    });
    this.socket.on('msgToClient', (message) => {
      if (message) {
        this.receivedMessage(message)
      } else {
        this.messages = []
      }
    });

    this.socket.on('connect', () => {
      // this.check();
    });

    this.socket.on('joinedRoom', (room) => {
      this.rooms[room] = true;
    });

    this.socket.on('leftRoomServer', (room) => {
      this.rooms[room] = false;
    }); */
  }
});
