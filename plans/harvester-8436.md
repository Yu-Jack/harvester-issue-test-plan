---
issue: 8436
repo: harvester/harvester
title: "[FEATURE] Resource Health Dashboard"
source: https://github.com/harvester/harvester/issues/8436#issuecomment-6514405862
---

## Pre-suite Test Setup

### 1. Install the Resource Health Controller

The controller lives in [harvester/resource-health-controller](https://github.com/harvester/resource-health-controller). Clone it first, and run the commands below from the repository root:

```bash
git clone https://github.com/harvester/resource-health-controller.git
cd resource-health-controller
```

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

### 5. Generate a support bundle

1. Create a support bundle.
2. Open the dashboard while the support bundle is generating.

Expected: an `Info` check `SupportBundleGenerating` is shown for the generating `SupportBundle`.

![test case 5](images/harvester-8436/5.png)


### 6. ScheduleVMBackup reaches max failure

1. Create a `ScheduleVMBackup` with **Retain** `3` and **Max Failure** `2`.
2. Set the cron schedule to a time that is about to arrive, so it triggers three times in a short period.
3. Make the scheduled backups fail (for example, use a backup target that cannot be written to).

Expected: an `Error` check `Reach Max Failure` is shown for the `ScheduleVMBackup`, with a message like `failure backups 2 reach max tolerance 2`.

![test case 6](images/harvester-8436/6.png)

### 7. Ignore a check

**7.1 Ignore a single resource**

1. Click **Ignore** on the `ImageRetryLimitExceeded` row.
2. Set **Scope** to `Selected resources`, keep one resource, and click **Ignore**.

Expected: the ignored resource is no longer listed in the check.

![test case 7.1 a](images/harvester-8436/7-1-a.png)
![test case 7.1 b](images/harvester-8436/7-1-b.png)
![test case 7.1 c](images/harvester-8436/7-1-c.png)

**7.2 Ignore the entire check**

1. Click **Ignore** on the `ImageRetryLimitExceeded` row.
2. Set **Scope** to `Entire check` and click **Ignore**.

Expected: the whole check disappears from the dashboard.

**7.3 Expired ignore rule**

1. Edit the latest `healthignorerules` resource and set `expire` to a past time:

```bash
kubectl get healthignorerules
kubectl edit healthignorerules <name>
```

Expected: the ignore no longer applies, and the check is shown on the dashboard again.
