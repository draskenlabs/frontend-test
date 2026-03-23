"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, RefreshCw, Trash2 } from "lucide-react";
import { CommonButton, CommonInput, PageHeader, DataTable } from "@/components/common";
import {
  convertEnquiryToLead,
  createEnquiry,
  deleteEnquiry,
  getEnquiries,
  updateEnquiry,
} from "@/lib/api/enquiry";
import { getServices } from "@/lib/api/service";
import { getSessionUserFromToken } from "@/lib/session";

type EnquiryRow = {
  id: string;
  name: string;
  phone: string;
  email: string;
  description: string;
  service: string;
  serviceId?: string;
  status?: "OPEN" | "IN_PROGRESS" | "CLOSED";
};

type ServiceOption = {
  id: string;
  name: string;
};

type ServiceApiResponse = {
  id: string;
  name: string;
};

type EnquiryApiResponse = {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  description?: string;
  service?: { id?: string; name?: string } | string;
  serviceId?: string;
  status?: "OPEN" | "IN_PROGRESS" | "CLOSED";
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export default function EnquiryDashboard() {
  const [data, setData] = useState<EnquiryRow[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [loading, setLoading] = useState(false);

  const [newEnquiry, setNewEnquiry] = useState({
    name: "",
    phone: "",
    email: "",
    serviceId: "",
    description: "",
  });

  const role = useMemo(() => getSessionUserFromToken()?.role, []);
  const canManageCrud = role === "SUPER_ADMIN" || role === "ADMIN";
  const canConvertLead = role === "SUPER_ADMIN" || role === "ADMIN" || role === "USER";

  const loadServices = useCallback(async () => {
    try {
      const res: unknown = await getServices();
      if (Array.isArray(res)) {
        const mapped = (res as ServiceApiResponse[]).map((item) => ({
          id: item.id,
          name: item.name,
        }));
        setServices(mapped);
        setNewEnquiry((current) => ({
          ...current,
          serviceId: current.serviceId || mapped[0]?.id || "",
        }));
      }
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Failed to load services"));
    }
  }, []);

  const loadEnquiries = useCallback(async () => {
    setLoading(true);
    try {
      const res: unknown = await getEnquiries();
      if (Array.isArray(res)) {
        const normalized = (res as EnquiryApiResponse[]).map((item) => ({
          id: item.id,
          name: item.name || "",
          phone: item.phone || "",
          email: item.email || "",
          description: item.description || "",
          service: typeof item.service === "object" ? item.service?.name || "-" : item.service || "-",
          serviceId: typeof item.service === "object" ? item.service?.id : item.serviceId,
          status: item.status,
        }));
        setData(normalized);
      }
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Failed to load enquiries"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
    loadEnquiries();
  }, [loadEnquiries, loadServices]);

  const handleCreate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageCrud) {
      return;
    }

    if (!newEnquiry.name.trim() || !newEnquiry.email.trim() || !newEnquiry.serviceId) {
      return;
    }

    try {
      const res = await createEnquiry({
        name: newEnquiry.name.trim(),
        email: newEnquiry.email.trim(),
        phone: newEnquiry.phone.trim(),
        serviceId: newEnquiry.serviceId,
        description: newEnquiry.description.trim(),
      });

      if (res?.id) {
        setNewEnquiry({
          name: "",
          phone: "",
          email: "",
          serviceId: services[0]?.id || "",
          description: "",
        });
        await loadEnquiries();
      }
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Failed to create enquiry"));
    }
  }, [canManageCrud, loadEnquiries, newEnquiry, services]);

  const handleEdit = useCallback(async (row: EnquiryRow) => {
    if (!canManageCrud) {
      return;
    }

    const name = window.prompt("Name", row.name);
    if (!name) {
      return;
    }

    const phone = window.prompt("Phone", row.phone) ?? row.phone;
    const email = window.prompt("Email", row.email) ?? row.email;
    const description = window.prompt("Description", row.description) ?? row.description;

    try {
      const res = await updateEnquiry(row.id, {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        description: description.trim(),
        serviceId: row.serviceId,
      });
      if (res?.id) {
        await loadEnquiries();
      }
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Failed to update enquiry"));
    }
  }, [canManageCrud, loadEnquiries]);

  const handleDelete = useCallback(async (id: string) => {
    if (!canManageCrud) {
      return;
    }

    if (!confirm("Are you sure you want to delete this enquiry?")) {
      return;
    }

    try {
      const res = await deleteEnquiry(id);
      if (res?.id) {
        await loadEnquiries();
      }
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Failed to delete enquiry"));
    }
  }, [canManageCrud, loadEnquiries]);

  const handleConvert = useCallback(async (id: string) => {
    if (!canConvertLead) {
      return;
    }

    try {
      const res = await convertEnquiryToLead(id);
      if (res?.id) {
        await loadEnquiries();
      }
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Failed to convert enquiry to lead"));
    }
  }, [canConvertLead, loadEnquiries]);

  const columns = useMemo<ColumnDef<EnquiryRow, unknown>[]>(
    () => [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "phone", header: "Phone" },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "service", header: "Service" },
      { accessorKey: "description", header: "Description" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <span>{row.original.status || "OPEN"}</span>,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const enquiry = row.original;

          return (
            <div className="flex flex-wrap items-center gap-2">
              {canManageCrud && (
                <>
                  <CommonButton size="sm" variant="outline" onClick={() => handleEdit(enquiry)}>
                    <Pencil className="mr-1 h-3.5 w-3.5" />
                    Edit
                  </CommonButton>
                  <CommonButton size="sm" variant="outline" onClick={() => handleDelete(enquiry.id)}>
                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                    Delete
                  </CommonButton>
                </>
              )}
              {canConvertLead && (
                <CommonButton size="sm" onClick={() => handleConvert(enquiry.id)}>
                  <RefreshCw className="mr-1 h-3.5 w-3.5" />
                  Convert to Lead
                </CommonButton>
              )}
            </div>
          );
        },
      },
    ],
    [canConvertLead, canManageCrud, handleConvert, handleDelete, handleEdit]
  );

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Customer Enquiries" description="Manage and convert customer enquiries" />

      {canManageCrud && (
        <form onSubmit={handleCreate} className="grid gap-3 rounded-xl border bg-white p-4 shadow-sm md:grid-cols-5">
          <CommonInput
            placeholder="Name"
            value={newEnquiry.name}
            onChange={(e) => setNewEnquiry((current) => ({ ...current, name: e.target.value }))}
            className="md:col-span-1"
            required
          />
          <CommonInput
            placeholder="Phone"
            value={newEnquiry.phone}
            onChange={(e) => setNewEnquiry((current) => ({ ...current, phone: e.target.value }))}
            className="md:col-span-1"
          />
          <CommonInput
            type="email"
            placeholder="Email"
            value={newEnquiry.email}
            onChange={(e) => setNewEnquiry((current) => ({ ...current, email: e.target.value }))}
            className="md:col-span-1"
            required
          />
          <select
            className="h-10 rounded-md border bg-white px-3 text-sm md:col-span-1"
            value={newEnquiry.serviceId}
            onChange={(e) => setNewEnquiry((current) => ({ ...current, serviceId: e.target.value }))}
            required
          >
            <option value="" disabled>
              Select service
            </option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
          <div className="md:col-span-1">
            <CommonButton type="submit" className="w-full">
              Add Enquiry
            </CommonButton>
          </div>
          <div className="md:col-span-5">
            <CommonInput
              placeholder="Description"
              value={newEnquiry.description}
              onChange={(e) => setNewEnquiry((current) => ({ ...current, description: e.target.value }))}
            />
          </div>
        </form>
      )}

      {!canManageCrud && canConvertLead && (
        <p className="rounded-lg border bg-white px-4 py-3 text-sm text-muted-foreground shadow-sm">
          You can view enquiries and convert them to leads. Create, edit, and delete are restricted.
        </p>
      )}

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading enquiries...</p>
        ) : (
          <DataTable
            columns={columns}
            data={data}
            searchKey="name"
            searchPlaceholder="Search enquiries..."
          />
        )}
      </div>
    </div>
  );
}
