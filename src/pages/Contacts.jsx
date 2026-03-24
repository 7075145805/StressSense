import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Users, Plus, Trash2, Phone, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const RELATIONSHIPS = ['Friend', 'Family', 'Partner', 'Colleague', 'Doctor'];

function ContactCard({ contact, onDelete, onEdit }) {
    const initials = contact.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const colors = ['bg-teal-500', 'bg-purple-500', 'bg-blue-500', 'bg-rose-500', 'bg-amber-500'];
    const color = colors[contact.name.charCodeAt(0) % colors.length];

    return (
        <motion.div
            className="bg-slate-900/50 rounded-xl p-4 border border-slate-800/50 flex items-center gap-3"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            layout
        >
            <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center shrink-0`}>
                <span className="text-white text-sm font-bold">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{contact.name}</p>
                <p className="text-xs text-slate-400">{contact.phone}</p>
                {contact.relationship && (
                    <span className="text-[10px] text-teal-400 bg-teal-400/10 px-1.5 py-0.5 rounded-full mt-0.5 inline-block">
                        {contact.relationship}
                    </span>
                )}
            </div>
            <div className="flex gap-1 shrink-0">
                <a href={`tel:${contact.phone}`}>
                    <Button size="icon" variant="ghost" className="w-8 h-8 text-teal-400 hover:bg-teal-400/10">
                        <Phone className="w-3.5 h-3.5" />
                    </Button>
                </a>
                <Button size="icon" variant="ghost" className="w-8 h-8 text-slate-500 hover:text-red-400 hover:bg-red-400/10"
                    onClick={() => onDelete(contact.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                </Button>
            </div>
        </motion.div>
    );
}

function AddContactForm({ onAdd, onCancel }) {
    const [form, setForm] = useState({ name: '', phone: '', relationship: 'Friend' });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.phone.trim()) return;
        onAdd(form);
    };

    return (
        <motion.form
            onSubmit={handleSubmit}
            className="bg-slate-900 rounded-2xl p-5 border border-teal-500/30 space-y-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
        >
            <p className="text-sm font-semibold text-white mb-1">Add Emergency Contact</p>
            <Input
                placeholder="Full name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                required
            />
            <Input
                placeholder="Phone number (e.g. +1234567890)"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                type="tel"
                required
            />
            <div className="flex gap-2 flex-wrap">
                {RELATIONSHIPS.map(rel => (
                    <button
                        key={rel} type="button"
                        onClick={() => setForm(f => ({ ...f, relationship: rel }))}
                        className={`text-xs px-3 py-1 rounded-full border transition-colors ${form.relationship === rel
                            ? 'bg-teal-500/20 border-teal-500/50 text-teal-300'
                            : 'border-slate-700 text-slate-500 hover:border-slate-600'
                            }`}
                    >
                        {rel}
                    </button>
                ))}
            </div>
            <div className="flex gap-2 pt-1">
                <Button type="submit" size="sm" className="flex-1 bg-teal-500 hover:bg-teal-600 text-white">
                    <Check className="w-3.5 h-3.5 mr-1" /> Save Contact
                </Button>
                <Button type="button" size="sm" variant="ghost" className="border border-slate-700 text-slate-400"
                    onClick={onCancel}>
                    <X className="w-3.5 h-3.5" />
                </Button>
            </div>
        </motion.form>
    );
}

export default function Contacts() {
    const [showForm, setShowForm] = useState(false);
    const qc = useQueryClient();

    const { data: contacts = [], isLoading } = useQuery({
        queryKey: ['contacts'],
        queryFn: () => base44.entities.EmergencyContact.list('priority', 20),
    });

    const addMutation = useMutation({
        mutationFn: (data) => base44.entities.EmergencyContact.create({ ...data, priority: contacts.length + 1 }),
        onSuccess: () => { qc.invalidateQueries(['contacts']); setShowForm(false); }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.EmergencyContact.delete(id),
        onSuccess: () => qc.invalidateQueries(['contacts'])
    });

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
                <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link to="/Monitor" className="text-slate-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-teal-400" />
                            <span className="font-semibold text-sm">Emergency Contacts</span>
                        </div>
                    </div>
                    <Button size="sm" onClick={() => setShowForm(true)}
                        className="bg-teal-500 hover:bg-teal-600 text-white h-8">
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add
                    </Button>
                </div>
            </header>

            <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
                {/* Info banner */}
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex gap-2">
                    <Phone className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-300 leading-relaxed">
                        When high stress is detected 3 times in a row, the app will automatically prompt a call
                        to your contacts in priority order.
                    </p>
                </div>

                <AnimatePresence>
                    {showForm && (
                        <AddContactForm
                            onAdd={(data) => addMutation.mutate(data)}
                            onCancel={() => setShowForm(false)}
                        />
                    )}
                </AnimatePresence>

                {isLoading ? (
                    <div className="flex justify-center py-16">
                        <div className="w-8 h-8 border-4 border-slate-700 border-t-teal-400 rounded-full animate-spin" />
                    </div>
                ) : contacts.length === 0 ? (
                    <div className="text-center py-16">
                        <Users className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                        <p className="text-slate-400 text-sm mb-1">No emergency contacts yet</p>
                        <p className="text-slate-600 text-xs">Add trusted friends or family who will be contacted during high stress</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {contacts.map(contact => (
                            <ContactCard
                                key={contact.id}
                                contact={contact}
                                onDelete={(id) => deleteMutation.mutate(id)}
                            />
                        ))}
                    </AnimatePresence>
                )}
            </main>
        </div>
    );
}