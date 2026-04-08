"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CommonButton, CommonInput, CommonTextarea } from "@/components/common"
import { createEnquiry } from "@/lib/api/enquiry"
import { getServices } from "@/lib/api/service"
import { ArrowLeft, CheckCircle } from "lucide-react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

interface ServiceOption {
  id: string
  name: string
}

export default function EnquiryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [services, setServices] = useState<ServiceOption[]>([])
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    serviceId: "",
    description: "",
  })

  useEffect(() => {
    const loadServices = async () => {
      try {
        const res: unknown = await getServices()
        if (Array.isArray(res)) {
          setServices(res as ServiceOption[])
          if (res.length > 0) {
            setForm((current) => ({
              ...current,
              serviceId: current.serviceId || res[0].id,
            }))
          }
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to load services"
        alert(message)
      }
    }

    loadServices()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await createEnquiry(form)

      if (result?.id) {
        setSubmitted(true)
        setForm({
          name: "",
          phone: "",
          email: "",
          serviceId: services[0]?.id ?? "",
          description: "",
        })
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to submit enquiry"
      alert(message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back()
      return
    }

    router.push("/")
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-10 text-center max-w-md w-full space-y-4"
        >
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Enquiry Submitted!</h2>
          <p className="text-gray-500">
            Thank you for reaching out. Our team will get back to you shortly.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <CommonButton variant="outline" onClick={() => router.back()} className="w-full">
              Go Back
            </CommonButton>
            <CommonButton
              onClick={() => setSubmitted(false)}
              className="w-full"
            >
              Submit Another Enquiry
            </CommonButton>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            <div className="flex items-center justify-start">
              <CommonButton type="button" variant="outline" size="sm" onClick={handleGoBack}>
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back
              </CommonButton>
            </div>
            <div className="text-center lg:text-left space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                Submit an Enquiry
              </h2>
              <p className="text-gray-500 text-sm">
                Let us know how we can assist you
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CommonInput
                  name="name"
                  id="name"
                  label="Full Name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
                <CommonInput
                  name="phone"
                  id="phone"
                  label="Phone Number"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <CommonInput
                name="email"
                id="email"
                type="email"
                label="Email Address"
                placeholder="john@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />

              <div className="space-y-2">
                <label htmlFor="serviceId" className="text-sm font-medium text-foreground">
                  Service Required
                </label>
                <select
                  id="serviceId"
                  name="serviceId"
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={form.serviceId}
                  onChange={handleChange}
                  required
                >
                  {services.length === 0 ? (
                    <option value="">No service available</option>
                  ) : (
                    services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <CommonTextarea
                name="description"
                id="description"
                label="Description"
                placeholder="Tell us about your requirements..."
                value={form.description}
                onChange={handleChange}
                rows={4}
                required
              />

              <CommonButton
                type="submit"
                loading={loading}
                className="w-full h-11 text-base"
              >
                Submit Enquiry
              </CommonButton>
            </form>

            <p className="text-xs text-center text-gray-400">
              By submitting, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}