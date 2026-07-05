import api from './axios'

export const getMyBetaFeatures = () => api.get('/features/opt-in/my')
export const optInFeature = (featureKey, optIn) => api.post('/features/opt-in/opt-in', { featureKey, optIn })
