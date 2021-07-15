const app = new Vue({
  el: '#app',
  data: {
    title: 'Emitir notificaciones "push"',
    text: '',
    selected: 'usuario1',
    messages: [],
    socket: null,
    activeRoom: '',
    rooms: {
      general: false,
      roomA: false,
      roomB: false,
      roomC: false,
      roomD: false,
    },
    listRooms: [
      "usuario1",
      "usuario2",
      "usuario3",
      "usuario4",
      "usuario5"
    ]
  },
  methods: {
    onChange(event) {
      this.socket.emit('leaveRoom', this.activeRoom);
      this.activeRoom = event.target.value;
      this.socket.emit('joinRoom', this.activeRoom);
    },

    sendMessage() {
      if (this.validateInput()) {
        const message = {
          uuid: this.activeRoom,
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
    check() {
      if (this.isMemberOfActiveRoom) {
        this.socket.emit('leaveRoom', this.activeRoom);
      } else {
        this.socket.emit('joinRoom', this.activeRoom);
        const message = {
          uuid: this.activeRoom
        };
        this.socket.emit('msgToServer', message);
      }
    }
  },
  computed: {
    isMemberOfActiveRoom() {
      return this.rooms[this.activeRoom];
    }
  },
  created() {
    this.activeRoom = this.selected;
    this.socket = io('http://localhost:3420/realtime', {
      transportOptions: {
        withCredentials: true,
        polling: {
          extraHeaders: {
            Authorization: this.activeRoom,
            
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
      console.log('***** recibo mensaje ******');
      console.log(message);
      console.log('*****************************');
      if (message) {
        this.receivedMessage(message)
      } else {
        this.messages = []
      }
    });

    this.socket.on('connect', () => {
      this.check();
    });

    this.socket.on('joinedRoom', (room) => {
      this.rooms[room] = true;
    });

    this.socket.on('leftRoomServer', (room) => {
      this.rooms[room] = false;
    });
  }
});
