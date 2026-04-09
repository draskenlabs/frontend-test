"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Check, Pencil, RefreshCw, Trash2, X } from "lucide-react";
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
  status?: "OPEN" | "NEW" | "IN_PROGRESS" | "CLOSED";
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
  status?: "OPEN" | "NEW" | "IN_PROGRESS" | "CLOSED";
};

type EditDraft = {
  name: string;
  phone: string;
  email: string;
  serviceId: string;
  description: string;
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const editDraftRef = useRef<EditDraft | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

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

  const startEdit = useCallback((row: EnquiryRow) => {
    if (!canManageCrud) {
      return;
    }

    setEditingId(row.id);
    editDraftRef.current = {
      name: row.name,
      phone: row.phone,
      email: row.email,
      serviceId: row.serviceId || services[0]?.id || "",
      description: row.description,
    };
  }, [canManageCrud, services]);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    editDraftRef.current = null;
  }, []);

  const saveEdit = useCallback(async (id: string) => {
    if (!canManageCrud || !editDraftRef.current) {
      return;
    }

    const draft = editDraftRef.current;

    if (!draft.name.trim() || !draft.email.trim() || !draft.serviceId) {
      return;
    }

    setSavingEdit(true);
    try {
      const res = await updateEnquiry(id, {
        name: draft.name.trim(),
        phone: draft.phone.trim(),
        email: draft.email.trim(),
        description: draft.description.trim(),
        serviceId: draft.serviceId,
      });
      if (res?.id) {
        cancelEdit();
        await loadEnquiries();
      }
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Failed to update enquiry"));
    } finally {
      setSavingEdit(false);
    }
  }, [cancelEdit, canManageCrud, loadEnquiries]);

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
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
          const enquiry = row.original;
          if (editingId === enquiry.id) {
            return (
              <CommonInput
                defaultValue={editDraftRef.current?.name || enquiry.name}
                onChange={(e) => {
                  if (editDraftRef.current) {
                    editDraftRef.current.name = e.target.value;
                  }
                }}
                className="h-8 min-w-36"
              />
            );
          }

          return <span>{enquiry.name}</span>;
        },
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => {
          const enquiry = row.original;
          if (editingId === enquiry.id) {
            return (
              <CommonInput
                defaultValue={editDraftRef.current?.phone || enquiry.phone}
                onChange={(e) => {
                  if (editDraftRef.current) {
                    editDraftRef.current.phone = e.target.value;
                  }
                }}
                className="h-8 min-w-32"
              />
            );
          }

          return <span>{enquiry.phone}</span>;
        },
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => {
          const enquiry = row.original;
          if (editingId === enquiry.id) {
            return (
              <CommonInput
                type="email"
                defaultValue={editDraftRef.current?.email || enquiry.email}
                onChange={(e) => {
                  if (editDraftRef.current) {
                    editDraftRef.current.email = e.target.value;
                  }
                }}
                className="h-8 min-w-44"
              />
            );
          }

          return <span>{enquiry.email}</span>;
        },
      },
      {
        accessorKey: "service",
        header: "Service",
        cell: ({ row }) => {
          const enquiry = row.original;
          if (editingId === enquiry.id) {
            return (
              <select
                className="h-8 min-w-40 rounded-md border bg-white px-2 text-sm"
                defaultValue={editDraftRef.current?.serviceId || enquiry.serviceId || services[0]?.id || ""}
                onChange={(e) => {
                  if (editDraftRef.current) {
                    editDraftRef.current.serviceId = e.target.value;
                  }
                }}
              >
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            );
          }

          return <span>{enquiry.service}</span>;
        },
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => {
          const enquiry = row.original;
          if (editingId === enquiry.id) {
            return (
              <CommonInput
                defaultValue={editDraftRef.current?.description || enquiry.description}
                onChange={(e) => {
                  if (editDraftRef.current) {
                    editDraftRef.current.description = e.target.value;
                  }
                }}
                className="h-8 min-w-44"
              />
            );
          }

          return <span>{enquiry.description}</span>;
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <span>{row.original.status || "NEW"}</span>,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const enquiry = row.original;
          const isEditing = editingId === enquiry.id;

          return (
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              {canManageCrud && (
                <>
                  {isEditing ? (
                    <>
                      <CommonButton
                        size="sm"
                        onClick={() => saveEdit(enquiry.id)}
                        loading={savingEdit}
                        className="h-8 px-2"
                      >
                        <Check className="mr-1 h-3.5 w-3.5" />
                        Save
                      </CommonButton>
                      <CommonButton size="sm" variant="outline" onClick={cancelEdit} className="h-8 px-2">
                        <X className="mr-1 h-3.5 w-3.5" />
                        Cancel
                      </CommonButton>
                    </>
                  ) : (
                    <>
                      <CommonButton size="sm" variant="outline" onClick={() => startEdit(enquiry)} className="h-8 px-2">
                        <Pencil className="mr-1 h-3.5 w-3.5" />
                        Edit
                      </CommonButton>
                      <CommonButton size="sm" variant="outline" onClick={() => handleDelete(enquiry.id)} className="h-8 px-2">
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                        Delete
                      </CommonButton>
                    </>
                  )}
                </>
              )}
              {canConvertLead && !isEditing && (
                <CommonButton size="sm" onClick={() => handleConvert(enquiry.id)} className="h-8 px-2">
                  <RefreshCw className="mr-1 h-3.5 w-3.5" />
                  Convert to Lead
                </CommonButton>
              )}
            </div>
          );
        },
      },
    ],
    [
      canConvertLead,
      canManageCrud,
      cancelEdit,
      editingId,
      handleConvert,
      handleDelete,
      saveEdit,
      savingEdit,
      services,
      startEdit,
    ]
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
