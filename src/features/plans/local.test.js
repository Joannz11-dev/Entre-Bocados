const { test } = require('node:test');
const assert = require('node:assert/strict');

const modules = import('./local.ts');
const today = '2026-11-17T19:00:00Z';
const clock = () => new Date(today);

test('the local workspace persists both sides of one plan without mixing unread notices', async () => {
  const { createLocalPlans } = await modules;
  const data = new Map([['entre-bocados-simulated-plans-v2', 'legacy']]);
  const storage = {
    getItem: async key => data.get(key) ?? null,
    setItem: async (key, value) => { data.set(key, value); },
    removeItem: async key => { data.delete(key); },
  };
  const demo = createLocalPlans(storage, clock);
  const alex = demo.forActor('alex');
  const sofia = demo.forActor('sofia');
  const matchId = (await alex.getPilotData()).matches[0].id;
  const [id, otherId] = await Promise.all([alex.createPlan(matchId), sofia.createPlan(matchId)]);
  assert.equal(id, otherId);
  assert.equal((await sofia.getPilotData()).unreadCount, 1);
  assert.equal((await alex.getPilotData()).unreadCount, 0);

  await Promise.all([alex.sendPlanMessage(id, ' Hola ', 'first'), alex.sendPlanMessage(id, ' Hola ', 'first')]);
  await sofia.markPlanNotificationsRead(id);
  await sofia.sendPlanMessage(id, '¡Hola!', 'reply');
  await assert.rejects(sofia.schedulePlan(id, today), /futura/);
  const tomorrow = '2026-11-18T23:00:00.000Z';
  await sofia.schedulePlan(id, tomorrow);
  const reopened = createLocalPlans(storage, clock).forActor('alex');
  assert.deepEqual((await reopened.getPlanMessages(id)).map(m => [m.sender_id, m.body]), [['alex', 'Hola'], ['sofia', '¡Hola!']]);
  assert.deepEqual((await reopened.getPlanNotifications()).map(n => n.kind), ['date_updated', 'new_message']);
  assert.equal((await reopened.getPlan(id)).planned_for, tomorrow);
  assert.equal((await sofia.getPilotData()).unreadCount, 0);

  await sofia.transitionPlan(id, 'cancelled');
  assert.equal((await reopened.getPlanNotifications())[0].kind, 'cancelled');
  await assert.rejects(reopened.sendPlanMessage(id, 'No permitido', 'new'), /disponible/);
  await assert.rejects(reopened.schedulePlan(id, tomorrow), /disponible/);
  assert.equal((await reopened.getPlanMessages(id)).length, 2);
  await demo.reset();
  assert.equal(await reopened.getPlan(id), null);
  assert.equal(data.get('entre-bocados-simulated-plans-v2'), 'legacy');
});

test('a rejected storage write leaves the old data intact and can be retried', async () => {
  const { createLocalPlans } = await modules;
  let saved = null;
  let fail = false;
  const demo = createLocalPlans({
    getItem: async () => saved,
    setItem: async (_, value) => { if (fail) throw Error('disk'); saved = value; },
    removeItem: async () => { saved = null; },
  }, clock);
  const alex = demo.forActor('alex');
  const id = await alex.createPlan((await alex.getPilotData()).matches[0].id);
  fail = true;
  await assert.rejects(alex.sendPlanMessage(id, 'Mensaje', 'retry'), /disk/);
  assert.deepEqual(await alex.getPlanMessages(id), []);
  fail = false;
  await alex.sendPlanMessage(id, 'Mensaje', 'retry');
  await alex.transitionPlan(id, 'visited');
  assert.equal((await alex.getPlan(id)).status, 'visited');
  assert.equal((await alex.getPlanMessages(id)).length, 1);
});
