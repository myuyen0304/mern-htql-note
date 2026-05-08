# Kubectl Cheat Sheet — htql-note

## Tại sao hands-on K8s với project này?

Project **htql-note** là MERN stack điển hình gồm 3 thành phần độc lập:
- **Frontend** — React/Vite, serve static file qua Nginx
- **Backend** — Express.js API, xử lý auth và business logic
- **MongoDB** — database lưu trữ

Đây là kiến trúc lý tưởng để học K8s vì mỗi thành phần sẽ được deploy thành 1 **Deployment** riêng, giao tiếp qua **Service** — đúng mô hình microservice mà K8s được thiết kế để quản lý.

### Học được gì qua từng phase?

| Phase | Làm gì | Học concept gì |
|-------|--------|----------------|
| 1 | Viết Dockerfile cho backend và frontend | Container hóa app, multi-stage build |
| 2 | Deploy MongoDB với PVC | StatefulData, PersistentVolume, ClusterIP |
| 3 | Deploy backend với ConfigMap + Secret | Inject config và credentials vào pod |
| 4 | Deploy frontend | Serve static app trong cluster |
| 5 | Cài Ingress, path-based routing | Single entrypoint, `/api/*` → backend, `/*` → frontend |
| 6 | Đóng gói thành Helm chart | Template hóa, tái sử dụng manifest |

### Vấn đề thực tế K8s giải quyết
kubectl logs -l app=backend -n htql-note
- **Tự heal** — pod crash sẽ được tự restart (Deployment controller)
- **Scaling** — thêm replica backend trong 1 lệnh, không downtime
- **Config tách khỏi code** — JWT secret, MongoDB URI không hardcode trong image
- **Service discovery** — backend tìm MongoDB qua tên `mongodb-svc`, không cần biết IP
- **Rolling update** — đổi version app không gián đoạn traffic

### Môi trường

- **Docker Desktop K8s** — single-node cluster chạy local trên Windows
- **nginx-ingress controller** — cần cài thêm để Ingress hoạt động
- **hostpath StorageClass** — mặc định của Docker Desktop, đủ dùng cho learning

---

## Checklist từng phase

### Phase 1 — Dockerize ✅

1. Đổi `frontend/src/api/axios.js` — baseURL từ `VITE_API_URL` sang `/api` (relative path, dùng được với Ingress)
2. Thêm Vite proxy vào `frontend/vite.config.js` — `/api` → `http://localhost:5000` (để local dev vẫn chạy được)
3. Viết `backend/Dockerfile` — Node 20-alpine, `npm ci --omit=dev`, expose 5000
4. Viết `frontend/Dockerfile` — multi-stage: build Vite → copy dist vào nginx:alpine
5. Viết `frontend/nginx.conf` — SPA routing (`try_files`), gzip
6. Viết `backend/.dockerignore` và `frontend/.dockerignore`
7. Build images:
   ```powershell
   docker build -t htql-backend:latest ./backend
   docker build -t htql-frontend:latest ./frontend
   ```
8. Test frontend container chạy được:
   ```powershell
   docker run -d -p 8080:80 htql-frontend:latest
   # Mở http://localhost:8080
   ```

---

### Phase 2 — Deploy MongoDB ✅

1. Enable Kubernetes trong Docker Desktop (Settings → Kubernetes → Enable → Apply & Restart)
2. Verify cluster hoạt động: `kubectl cluster-info`
3. Viết `k8s/namespace.yaml`
4. Viết `k8s/mongodb/mongodb-pvc.yaml` — 1Gi ReadWriteOnce
5. Viết `k8s/mongodb/mongodb-deployment.yaml` — mongo:7, mount PVC vào `/data/db`
6. Viết `k8s/mongodb/mongodb-service.yaml` — ClusterIP, tên `mongodb-svc`, port 27017
7. Apply:
   ```powershell
   kubectl apply -f k8s/namespace.yaml
   kubectl apply -f k8s/mongodb/
   ```
8. Verify:
   ```powershell
   kubectl get pods -n htql-note -w      # mongodb-xxx → Running
   kubectl get pvc -n htql-note          # mongodb-pvc → Bound
   kubectl get svc -n htql-note          # mongodb-svc → ClusterIP:27017
   ```

---

### Phase 3 — Deploy Backend

1. Encode JWT_SECRET sang base64:
   ```powershell
   [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes("your_jwt_secret_key_here"))
   ```
2. Viết `k8s/backend/backend-configmap.yaml` — PORT, MONGO_URI
3. Viết `k8s/backend/backend-secret.yaml` — JWT_SECRET (base64)
4. Viết `k8s/backend/backend-deployment.yaml` — image `htql-backend:latest`, `imagePullPolicy: Never`, `envFrom` ConfigMap + Secret
5. Viết `k8s/backend/backend-service.yaml` — ClusterIP, tên `backend-svc`, port 5000
6. Apply:
   ```powershell
   kubectl apply -f k8s/backend/
   ```
7. Verify:
   ```powershell
   kubectl get pods -n htql-note -w               # backend-xxx → Running
   kubectl logs -l app=backend -n htql-note       # thấy "MongoDB connected"
   kubectl get svc -n htql-note                   # backend-svc → ClusterIP:5000
   ```

---

### Phase 4 — Deploy Frontend

1. Viết `k8s/frontend/frontend-deployment.yaml` — image `htql-frontend:latest`, `imagePullPolicy: Never`, port 80
2. Viết `k8s/frontend/frontend-service.yaml` — ClusterIP, tên `frontend-svc`, port 80
3. Apply:
   ```powershell
   kubectl apply -f k8s/frontend/
   ```
4. Verify:
   ```powershell
   kubectl get pods -n htql-note -w      # frontend-xxx → Running
   kubectl get svc -n htql-note          # frontend-svc → ClusterIP:80
   ```

---

### Phase 5 — Ingress (path-based routing)

1. Cài nginx-ingress controller:
   ```powershell
   kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.1/deploy/static/provider/cloud/deploy.yaml
   ```
2. Chờ ingress controller ready:
   ```powershell
   kubectl get pods -n ingress-nginx -w
   ```
3. Viết `k8s/ingress.yaml` — route `/api/` → `backend-svc:5000`, `/` → `frontend-svc:80`
4. Apply:
   ```powershell
   kubectl apply -f k8s/ingress.yaml
   ```
5. Verify:
   ```powershell
   kubectl get ingress -n htql-note
   # Mở http://localhost — frontend load được, /api/... gọi được backend
   ```

---

### Phase 6 — Helm Chart

1. Tạo chart skeleton: `helm create htql-note`
2. Xóa template mặc định, copy manifest từ `k8s/` vào `templates/`
3. Parameterize các giá trị hay thay đổi vào `values.yaml` (image tag, replicas, secret)
4. Test render: `helm template htql-note ./htql-note`
5. Install: `helm install htql-note ./htql-note -n htql-note`
6. Upgrade khi đổi config: `helm upgrade htql-note ./htql-note -n htql-note`
7. Uninstall: `helm uninstall htql-note -n htql-note`

---

## Cluster

```bash
kubectl cluster-info                    # Kiểm tra cluster có chạy không
kubectl get nodes                       # Liệt kê nodes trong cluster
kubectl config current-context          # Xem đang dùng cluster nào
kubectl config get-contexts             # Liệt kê tất cả cluster đã config
kubectl config use-context docker-desktop  # Chuyển sang Docker Desktop cluster
```

---

## Namespace

```bash
kubectl get namespace                   # Liệt kê tất cả namespace
kubectl apply -f k8s/namespace.yaml     # Tạo namespace từ file
kubectl delete namespace htql-note      # Xóa namespace (xóa luôn mọi resource bên trong)
```

> Namespace giống "folder" để nhóm các resource lại, tránh conflict với app khác trên cùng cluster.

---

## Apply / Delete manifest

```bash
kubectl apply -f <file.yaml>            # Tạo hoặc cập nhật resource từ file
kubectl apply -f <folder>/              # Apply tất cả file .yaml trong folder
kubectl delete -f <file.yaml>           # Xóa resource được định nghĩa trong file
kubectl delete -f <folder>/             # Xóa tất cả resource trong folder
```

> `apply` là idempotent — chạy nhiều lần không bị lỗi, chỉ cập nhật nếu có thay đổi.

---

## Pod

```bash
kubectl get pods -n htql-note                      # Liệt kê pods trong namespace
kubectl get pods -n htql-note -w                   # Watch — tự động refresh khi có thay đổi
kubectl describe pod <pod-name> -n htql-note       # Xem chi tiết pod (events, lỗi)
kubectl logs <pod-name> -n htql-note               # Xem log của pod
kubectl logs <pod-name> -n htql-note -f            # Follow log (real-time)
kubectl exec -it <pod-name> -n htql-note -- sh     # Vào trong container
kubectl delete pod <pod-name> -n htql-note         # Xóa pod (Deployment sẽ tự tạo lại)
```

> Pod là đơn vị nhỏ nhất trong K8s — chứa 1 hoặc nhiều container.

---

## Deployment

```bash
kubectl get deployment -n htql-note                         # Liệt kê deployments
kubectl describe deployment <name> -n htql-note             # Xem chi tiết deployment
kubectl rollout status deployment/<name> -n htql-note       # Theo dõi quá trình rollout
kubectl rollout restart deployment/<name> -n htql-note      # Restart tất cả pods của deployment
kubectl scale deployment <name> --replicas=3 -n htql-note   # Scale lên 3 replicas
```

> Deployment quản lý vòng đời Pod — tự restart khi pod crash, rolling update khi đổi image.

---

## Service

```bash
kubectl get svc -n htql-note                    # Liệt kê services
kubectl describe svc <name> -n htql-note        # Xem chi tiết service (endpoints, selector)
```

> Service là stable endpoint để các pod giao tiếp với nhau.  
> - `ClusterIP` — chỉ truy cập được trong cluster  
> - `NodePort` — expose ra ngoài qua port của node  
> - `LoadBalancer` — expose ra ngoài qua external IP (dùng với cloud hoặc Docker Desktop)

---

## PersistentVolumeClaim (PVC)

```bash
kubectl get pvc -n htql-note                    # Liệt kê PVCs
kubectl describe pvc <name> -n htql-note        # Xem chi tiết (STATUS phải là Bound)
```

> PVC là "yêu cầu xin storage" từ cluster.  
> - `Pending` — chưa có storage phù hợp  
> - `Bound` — đã được cấp storage, sẵn sàng dùng  

---

## ConfigMap & Secret

```bash
kubectl get configmap -n htql-note              # Liệt kê configmaps
kubectl get secret -n htql-note                 # Liệt kê secrets
kubectl describe configmap <name> -n htql-note  # Xem nội dung configmap
kubectl describe secret <name> -n htql-note     # Xem metadata (giá trị bị ẩn)
kubectl get secret <name> -n htql-note -o yaml  # Xem giá trị (base64 encoded)
```

> ConfigMap lưu config không nhạy cảm (PORT, URL).  
> Secret lưu thông tin nhạy cảm (password, JWT secret) — encode base64, không phải encrypt.

---

## Ingress

```bash
kubectl get ingress -n htql-note                # Liệt kê ingress rules
kubectl describe ingress <name> -n htql-note    # Xem chi tiết routing rules
```

> Ingress là "router" ở cổng vào cluster — route traffic theo path hoặc hostname.  
> Cần cài **ingress controller** (nginx-ingress) mới hoạt động.

---

## Debug nhanh

```bash
# Xem tất cả resource trong namespace cùng lúc
kubectl get all -n htql-note

# Xem events (lý do pod fail, image pull error...)
kubectl get events -n htql-note --sort-by='.lastTimestamp'

# Test kết nối từ trong cluster (dùng pod tạm)
kubectl run tmp --image=busybox -it --rm -n htql-note -- wget -qO- http://mongodb-svc:27017
```

---

## Workflow chuẩn khi debug pod không start

1. `kubectl get pods -n htql-note` — xem STATUS (CrashLoopBackOff, ImagePullBackOff, Pending...)
2. `kubectl describe pod <name> -n htql-note` — đọc phần **Events** ở cuối
3. `kubectl logs <name> -n htql-note` — xem lỗi từ app bên trong container

---

## Phase 2 — Deploy MongoDB với PVC

### Mục tiêu
Chạy MongoDB trong cluster với storage bền vững (data không mất khi pod restart).

### Các file manifest

**`k8s/namespace.yaml`** — tạo "folder" chứa toàn bộ resource của app:
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: htql-note
```

**`k8s/mongodb/mongodb-pvc.yaml`** — xin 1Gi storage từ cluster:
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mongodb-pvc
  namespace: htql-note
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
```

**`k8s/mongodb/mongodb-deployment.yaml`** — chạy pod MongoDB, mount PVC vào `/data/db`:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mongodb
  namespace: htql-note
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mongodb
  template:
    metadata:
      labels:
        app: mongodb
    spec:
      containers:
        - name: mongodb
          image: mongo:7
          ports:
            - containerPort: 27017
          volumeMounts:
            - name: data
              mountPath: /data/db
      volumes:
        - name: data
          persistentVolumeClaim:
            claimName: mongodb-pvc
```

**`k8s/mongodb/mongodb-service.yaml`** — expose MongoDB trong cluster qua tên `mongodb-svc`:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: mongodb-svc
  namespace: htql-note
spec:
  selector:
    app: mongodb
  ports:
    - port: 27017
      targetPort: 27017
  type: ClusterIP
```

### Apply và kiểm tra

```bash
# Tạo namespace trước
kubectl apply -f k8s/namespace.yaml
kubectl get namespace htql-note

# Deploy MongoDB (PVC + Deployment + Service cùng lúc)
kubectl apply -f k8s/mongodb/

# Theo dõi pod khởi động (Ctrl+C để thoát)
kubectl get pods -n htql-note -w

# Kiểm tra PVC đã được cấp storage chưa
kubectl get pvc -n htql-note

# Kiểm tra service
kubectl get svc -n htql-note
```

### Kết quả mong đợi

| Resource | Tên | STATUS mong đợi |
|----------|-----|-----------------|
| Pod | `mongodb-<hash>` | `Running` |
| PVC | `mongodb-pvc` | `Bound` |
| Service | `mongodb-svc` | `ClusterIP` port `27017` |

### Tại sao cần PVC?

Nếu không có PVC, data MongoDB nằm trong container filesystem. Pod restart → container bị xóa → **mất toàn bộ data**.

PVC tách storage ra khỏi pod lifecycle:
- Pod chết → PVC vẫn còn → pod mới mount lại → data nguyên vẹn
- Docker Desktop dùng `hostpath` StorageClass — lưu thực tế vào folder trên máy host

### Tại sao dùng ClusterIP thay vì NodePort?

MongoDB chỉ cần backend kết nối tới, không cần expose ra ngoài internet.  
ClusterIP chỉ reachable trong cluster → an toàn hơn.  
Backend sẽ kết nối qua URI: `mongodb://mongodb-svc:27017/mern_htql`  
K8s DNS tự resolve tên `mongodb-svc` → IP của service.

---

## Phase 3 — Deploy Backend với ConfigMap + Secret

### Mục tiêu
Chạy Express.js API trong cluster, inject config và credentials vào pod mà không hardcode trong image.

### Tại sao tách ConfigMap và Secret?

| Loại | Dùng cho | Bảo mật |
|------|----------|---------|
| ConfigMap | Config không nhạy cảm: PORT, MONGO_URI | Lưu plaintext, ai cũng đọc được |
| Secret | Thông tin nhạy cảm: JWT_SECRET | Encode base64, giới hạn quyền truy cập |

> Base64 **không phải** mã hóa — chỉ là encoding. Secret an toàn hơn ConfigMap vì K8s có thể giới hạn RBAC và không log giá trị ra.

### Tạo base64 cho JWT_SECRET

```powershell
# Encode secret của bạn sang base64
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes("your_jwt_secret_key_here"))
# Output: eW91cl9qd3Rfc2VjcmV0X2tleV9oZXJl  ← dán vào backend-secret.yaml
```

### Các file manifest

**`k8s/backend/backend-configmap.yaml`** — config không nhạy cảm:
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: backend-config
  namespace: htql-note
data:
  PORT: "5000"
  MONGO_URI: "mongodb://mongodb-svc:27017/mern_htql"
```

> `MONGO_URI` dùng tên service `mongodb-svc` thay vì IP — K8s DNS tự resolve.

**`k8s/backend/backend-secret.yaml`** — credentials nhạy cảm:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: backend-secret
  namespace: htql-note
type: Opaque
data:
  JWT_SECRET: eW91cl9qd3Rfc2VjcmV0X2tleV9oZXJl
```

> `type: Opaque` — secret dạng tự do (key-value tùy ý), khác với các type có cấu trúc như `kubernetes.io/tls`.

**`k8s/backend/backend-deployment.yaml`** — pod backend, inject env từ ConfigMap + Secret:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: htql-note
spec:
  replicas: 1
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
        - name: backend
          image: htql-backend:latest
          imagePullPolicy: Never
          ports:
            - containerPort: 5000
          envFrom:
            - configMapRef:
                name: backend-config
            - secretRef:
                name: backend-secret
```

> `imagePullPolicy: Never` — dùng image local đã build sẵn, không kéo từ Docker Hub.  
> `envFrom` — inject **toàn bộ** key từ ConfigMap và Secret thành env var trong container.

**`k8s/backend/backend-service.yaml`** — expose backend trong cluster:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-svc
  namespace: htql-note
spec:
  selector:
    app: backend
  ports:
    - port: 5000
      targetPort: 5000
  type: ClusterIP
```

> Frontend (qua Ingress) sẽ route `/api/*` → `backend-svc:5000`.

### Apply và kiểm tra

```bash
kubectl apply -f k8s/backend/

# Theo dõi pod khởi động
kubectl get pods -n htql-note -w

# Xem log backend (kiểm tra connected MongoDB chưa)
kubectl logs -l app=backend -n htql-note

# Kiểm tra env var đã inject đúng chưa
kubectl exec -it <backend-pod-name> -n htql-note -- sh -c "echo $PORT && echo $MONGO_URI"

# Xem tất cả service
kubectl get svc -n htql-note
```

### Kết quả mong đợi

| Resource | Tên | STATUS mong đợi |
|----------|-----|-----------------|
| Pod | `backend-<hash>` | `Running` |
| Service | `backend-svc` | `ClusterIP` port `5000` |

Log backend phải có dòng:
```
Server running on port 5000
MongoDB connected
```