import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomePage.vue')
  },
  {
    path: '/athlete/:id',
    name: 'Athlete',
    component: () => import('../views/AthletePage.vue')
  },
  {
    path: '/athlete/:id/score',
    name: 'AthleteScore',
    component: () => import('../views/AthleteScorePage.vue')
  },
  {
    path: '/tournaments',
    name: 'Tournaments',
    component: () => import('../views/TournamentsPage.vue')
  },
  {
    path: '/tournament/:id',
    name: 'Tournament',
    component: () => import('../views/TournamentPage.vue')
  },
  {
    path: '/event/:id',
    name: 'Event',
    component: () => import('../views/EventPage.vue')
  },
  {
    path: '/match/:id',
    name: 'Match',
    component: () => import('../views/MatchPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
