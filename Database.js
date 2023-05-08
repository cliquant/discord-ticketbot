const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

let activeTickets = [];

async function load() {
  await prepare();
  await loadActiveTickets();
}

async function prepare() {
  console.log("[DB] Preparing database")
  return new Promise((resolve, reject) => {
    db.run(
      'CREATE TABLE IF NOT EXISTS tickets (channel TEXT PRIMARY KEY, owner TEXT, ticketid INTEGER, closed INTEGER)',
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
}

async function loadActiveTickets() {
  console.log("[DB] Loading active tickets")
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM tickets WHERE closed = 0', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        activeTickets = rows;
        console.log(`[DB] Loaded ${rows.length} active tickets`)
        resolve();
      }
    });
  });
}

function getTicket(channel) {
  return new Promise((resolve, reject) => {
    try {
      let ticket = activeTickets.find((ticket) => ticket.channel === channel);
      if (ticket) {
        resolve(ticket);
      } else {
        db.get(
          'SELECT * FROM tickets WHERE channel = ?',
          [channel],
          (err, row) => {
            if (err) {
              reject(err);
            } else if (row) {
              activeTickets.push(row);
              resolve(row);
            } else {
              resolve(null);
            }
          }
        );
      }
    } catch (error) {
      console.error('Error in getTicket:', error);
      reject(error);
    }
  });
}

function getTicket2(channel) {
  let ticket = activeTickets.find((ticket) => ticket.channel === channel);
  if (ticket) {
    if(ticket.closed == 1) {
      return false;
    } else {
      return true;
    }
  } else {
    return false;
  }
}

function getLastDatabaseId() {
  return new Promise((resolve, reject) => {
    db.get("SELECT COUNT(*) AS count FROM tickets", (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row.count);
      }
    });
  });
}

function getArrayActiveLength() {
  return new Promise((resolve, reject) => {
        resolve(activeTickets.length);
  });
}

function createTicket(channel, owner) {
  return new Promise((resolve, reject) => {
    async function exectee() {
      db.run(
        'INSERT INTO tickets (channel, owner, ticketid, closed) VALUES (?, ?, ?, ?)',
        [channel, owner, parseInt(await getLastDatabaseId() + 1), 0],
        function (err) {
          if (err) {
            reject(err);
          } else {
            async function push() {
              let ticket = {
                channel,
                owner,
                closed: 0,
                ticketid: parseInt(await getLastDatabaseId()),
              };
              activeTickets.push(ticket);
              console.log("[DB] Creating new ticket " + channel)
              resolve(ticket);
            }
            push();
          }
        }
      );
    }
    exectee();
  });
}

function closeTicket(channel) {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE tickets SET closed = 1 WHERE channel = ?',
      [channel],
      (err) => {
        if (err) {
          reject(err);
        } else {
          activeTickets = activeTickets.filter(
            (ticket) => ticket.channel !== channel
          );
          resolve();
        }
      }
    );
  });
}

module.exports = {
  db,
  activeTickets,
  load,
  getTicket,
  getTicket2,
  getArrayActiveLength,
  getLastDatabaseId,
  createTicket,
  closeTicket,
};