/**
 * Tiny synchronous JSON-file datastore.
 * Real persistence to disk, no native compiled dependencies required
 * (keeps the project installable anywhere Node runs).
 */
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "mechapulse.json");

function load() {
  if (!fs.existsSync(FILE)) {
    const initial = { users: [], subscriptions: [], orders: [], articleReads: [], seq: { users: 1, subscriptions: 1, orders: 1, articleReads: 1 } };
    fs.writeFileSync(FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(FILE, "utf-8"));
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

let state = load();

function nextId(table) {
  const id = state.seq[table]++;
  save(state);
  return id;
}

module.exports = {
  // users
  findUserByEmail: (email) => state.users.find((u) => u.email.toLowerCase() === email.toLowerCase()),
  findUserById: (id) => state.users.find((u) => u.id === id),
  createUser: ({ email, passwordHash }) => {
    const user = { id: nextId("users"), email, passwordHash, avatarUrl: null, createdAt: new Date().toISOString() };
    state.users.push(user);
    save(state);
    return user;
  },
  updateUser: (id, patch) => {
    const user = state.users.find((u) => u.id === id);
    if (!user) return null;
    Object.assign(user, patch);
    save(state);
    return user;
  },

  // subscriptions
  listSubscriptions: (userId) => state.subscriptions.filter((s) => s.userId === userId),
  upsertSubscription: (userId, toolName, plan) => {
    let sub = state.subscriptions.find((s) => s.userId === userId && s.toolName === toolName);
    if (sub) sub.plan = plan;
    else {
      sub = { id: nextId("subscriptions"), userId, toolName, plan, createdAt: new Date().toISOString() };
      state.subscriptions.push(sub);
    }
    save(state);
    return sub;
  },
  deleteSubscription: (userId, toolName) => {
    state.subscriptions = state.subscriptions.filter((s) => !(s.userId === userId && s.toolName === toolName));
    save(state);
  },

  // orders
  createOrder: (userId, robotName, marketplace, price) => {
    const order = { id: nextId("orders"), userId, robotName, marketplace, price, createdAt: new Date().toISOString() };
    state.orders.push(order);
    save(state);
    return order;
  },
  listOrders: (userId) => state.orders.filter((o) => o.userId === userId).sort((a, b) => b.id - a.id),

  // article reads
  recordRead: (userId, title) => {
    const rec = { id: nextId("articleReads"), userId, title, createdAt: new Date().toISOString() };
    state.articleReads.push(rec);
    save(state);
    return rec;
  },
  allReads: () => state.articleReads,

  _reload: () => { state = load(); },
};
