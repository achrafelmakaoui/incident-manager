import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createIncident } from '../services/incidentService'
import { CATEGORY_LABELS, PRIORITY_LABELS } from '../utils/labels'

const EMPTY = { title: '', description: '', category: '', priority: '' }

export default function NewIncident() {
    const navigate = useNavigate()
    const [form, setForm] = useState(EMPTY)
    const [fieldErrors, setFieldErrors] = useState({})
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    function validate() {
        const errors = {}
        if (!form.title.trim()) errors.title = 'Le titre est obligatoire'
        if (!form.description.trim()) errors.description = 'La description est obligatoire'
        if (!form.category) errors.category = 'La catégorie est obligatoire'
        if (!form.priority) errors.priority = 'La priorité est obligatoire'
        return errors
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        const errors = validate()
        setFieldErrors(errors)
        if (Object.keys(errors).length > 0) return

        setLoading(true)
        try {
            const created = await createIncident(form)
            navigate(`/incidents/${created.id}`)
        } catch (err) {
            const data = err.response?.data
            setFieldErrors(data?.errors ?? {})
            setError(data?.message || "Impossible de créer l'incident")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container">
            <div className="page-header">
                <h1>Déclarer un incident</h1>
            </div>

            <form className="card" onSubmit={handleSubmit} noValidate>
                {error && <div className="alert alert-error">{error}</div>}

                <div className="form-group">
                    <label htmlFor="title">Titre</label>
                    <input id="title" name="title" className="input" maxLength={150}
                           placeholder="Ex. : Mon ordinateur affiche une alerte antivirus"
                           value={form.title} onChange={handleChange} />
                    {fieldErrors.title && <span className="field-error">{fieldErrors.title}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea id="description" name="description" className="textarea" maxLength={2000}
                              placeholder="Décrivez ce que vous avez constaté, quand, et sur quel poste."
                              value={form.description} onChange={handleChange} />
                    {fieldErrors.description && <span className="field-error">{fieldErrors.description}</span>}
                </div>

                <div className="row" style={{ alignItems: 'flex-start' }}>
                    <div className="form-group" style={{ flex: 1, minWidth: 200 }}>
                        <label htmlFor="category">Catégorie</label>
                        <select id="category" name="category" className="select"
                                value={form.category} onChange={handleChange}>
                            <option value="">— Choisir —</option>
                            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                        {fieldErrors.category && <span className="field-error">{fieldErrors.category}</span>}
                    </div>

                    <div className="form-group" style={{ flex: 1, minWidth: 200 }}>
                        <label htmlFor="priority">Priorité</label>
                        <select id="priority" name="priority" className="select"
                                value={form.priority} onChange={handleChange}>
                            <option value="">— Choisir —</option>
                            {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                        {fieldErrors.priority && <span className="field-error">{fieldErrors.priority}</span>}
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/incidents/my')}>
                        Annuler
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Envoi...' : "Déclarer l'incident"}
                    </button>
                </div>
            </form>
        </div>
    )
}