import { calcularMetricasDashboard } from '../engine/economyEngine.js'

export async function getMetrics(req, res, next) {
  try {
    const metricas = await calcularMetricasDashboard()
    res.json(metricas)
  } catch (err) {
    next(err)
  }
}
