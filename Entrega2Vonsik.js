const fs = require('fs');

class TicketManager {
  constructor(path) {
    this.path = path;
    this.eventos = [];
    let precioBaseDeGanancia = 0;
    this.productos = [];
    this.nextEventoId = 1; 
    this.nextProductId = 1; 

    Object.defineProperty(this, 'precioBaseDeGanancia', {
      get: function () {
        return precioBaseDeGanancia;
      },
      set: function (value) {
        precioBaseDeGanancia = value;
      },
    });

    this.loadProducts();
  }

  loadProducts() {
    try {
      const data = fs.readFileSync(this.path, 'utf8');
      this.productos = JSON.parse(data);
      const lastProductId = this.productos.length > 0 ? this.productos[this.productos.length - 1].id : 0;
      this.nextProductId = lastProductId + 1;
    } catch (err) {
      this.productos = [];
    }
  }

  saveProducts() {
    fs.writeFileSync(this.path, JSON.stringify(this.productos), 'utf8');
  }

  getEvento() {
    return this.eventos;
  }

  agregarEvento(nombre, lugar, precio, capacidad = 50, fecha = new Date().toISOString().slice(0, 10)) {
    precio += precio * 0.15; 

    const evento = {
      id: this.nextEventoId++, 
      nombre,
      lugar,
      precio,
      capacidad,
      fecha,
    };

    this.eventos.push(evento);
  }

  idUsuario(idEvento, idUsuario) {
    const evento = this.eventos.find((evento) => evento.id === idEvento);
    if (evento) {
      evento.participantes = evento.participantes || [];
      evento.participantes.push(idUsuario);
    }
  }

  ponerEventoEnGira(idEvento, nuevaLocalidad, nuevaFecha) {
    const eventoExistente = this.eventos.find((evento) => evento.id === idEvento);
    if (eventoExistente) {
      const eventoCopia = {
        ...eventoExistente,
        localidad: nuevaLocalidad,
        fecha: nuevaFecha,
        id: this.nextEventoId++, 
      };
      eventoCopia.participantes = [];
      this.eventos.push(eventoCopia);
    }
  }

  addProduct(producto) {
    producto.id = this.nextProductId++; 
    this.productos.push(producto);
    this.saveProducts(); 
  }

  getProduct() {
    return this.productos;
  }

  getProductById(id) {
    return this.productos.find((producto) => producto.id === id);
  }

  updateProduct(id, updatedFields) {
    const index = this.productos.findIndex((producto) => producto.id === id);
    if (index !== -1) {
      this.productos[index] = { ...this.productos[index], ...updatedFields };
      this.saveProducts(); 
    }
  }

  deleteProduct(id) {
    const index = this.productos.findIndex((producto) => producto.id === id);
    if (index !== -1) {
      this.productos.splice(index, 1);
      this.saveProducts(); 
    }
  }
}

const ticketManager = new TicketManager('./productos.json');

ticketManager.agregarEvento('Coldplay', 'Estadio Velez', 100);
ticketManager.agregarEvento('Sisnes Negros', 'Teatro Colón', 80, 200, '2023-07-20');

console.log(ticketManager.getEvento());

ticketManager.idUsuario(1, 'user1');
ticketManager.idUsuario(2, 'user2');

console.log(ticketManager.getEvento());

ticketManager.ponerEventoEnGira(1, 'Monumental', '2023-08-10');

console.log(ticketManager.getEvento());

ticketManager.addProduct({
  title: 'Camiseta',
  description: 'Camiseta de colección',
  price: 20,
  thumbnail: '/ruta/camiseta.jpg',
  code: 'CM01',
  stock: 50,
});

ticketManager.addProduct({
  title: 'Entrada VIP',
  description: 'Entrada especial con acceso a zonas exclusivas',
  price: 50,
  thumbnail: '/ruta/entrada_vip.jpg',
  code: 'VIP01',
  stock: 10,
});

console.log(ticketManager.getProduct());

console.log(ticketManager.getProductById(2));


ticketManager.updateProduct(2, { price: 55, stock: 8 });
console.log(ticketManager.getProduct());


ticketManager.deleteProduct(1);
console.log(ticketManager.getProduct());
