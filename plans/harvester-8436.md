---
issue: 8436
repo: harvester/harvester
title: "[FEATURE] Resource Health Dashboard"
source: https://github.com/harvester/harvester/issues/8436#issuecomment-6514405862
---

## Pre-suite Test Setup

### 1. Install the Resource Health Controller

Make sure `kubectl` is connected to the target Harvester cluster, then run:

```bash
helm install harvester-resource-health-controller ./chart \
  -n harvester-system \
  --set image.repository=jk82421/harvester-resource-health-controller \
  --set image.tag=dev-15
```

### 2. Verify ComponentHealth Resources

```bash
kubectl get componenthealth
```

Confirm that the command lists the `ComponentHealth` resources.

### 3. Run the Harvester UI Extension

1. Check out the code from [Harvester UI Extension PR #1209](https://github.com/harvester/harvester-ui-extension/pull/1209).
2. In the extension project directory, install dependencies and start the development server:

```bash
yarn

RANCHER_ENV=harvester \
VUE_APP_SERVER_VERSION=v1.10.0 \
API=https://<your-harvester-dashboard-url> \
yarn dev
```

Replace `<your-harvester-dashboard-url>` with the URL of the target Harvester dashboard.

## Test Cases

### 1. Virtual machine with a node selector

1. Create a virtual machine with a node selector.
2. Open the dashboard.

Expected: a `VMNodeSelectorLiveMigrationUnsupported` check is shown.

![test case 1](images/harvester-8436/1.png)

### 2. Virtual machine with insufficient volume replicas

1. Create a storage class whose replica count is larger than the number of nodes.
2. Create a virtual machine that uses this storage class, then start it.

Expected: the dashboard reports the volume replica issue.

![test case 2](images/harvester-8436/2.png)

### 3. Virtual machine image with a wrong URL

1. Create a virtual machine image with an invalid download URL.

Expected: the dashboard reports the failed image.

![test case 3](images/harvester-8436/3.png)

### 4. Back up a virtual machine with insufficient space

1. Set up a backup target and give its backup bucket only a small amount of space.
2. Start a backup of a virtual machine.

Expected: the dashboard reports the failed backup.

![test case 4](images/harvester-8436/4.png)

