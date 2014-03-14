set -x
go install .

simulator -output-directory=$PWD/runs/etcd1-e1-r1 -etcd-nodes=1 -executors=1 -run-onces=1
simulator -output-directory=$PWD/runs/etcd1-e1-r10 -etcd-nodes=1 -executors=1 -run-onces=10

simulator -output-directory=$PWD/runs/etcd1-e10-r10 -etcd-nodes=1 -executors=10 -run-onces=10
simulator -output-directory=$PWD/runs/etcd1-e10-r100 -etcd-nodes=1 -executors=10 -run-onces=100
simulator -output-directory=$PWD/runs/etcd1-e10-r500 -etcd-nodes=1 -executors=10 -run-onces=500
simulator -output-directory=$PWD/runs/etcd1-e10-r1000 -etcd-nodes=1 -executors=10 -run-onces=1000

simulator -output-directory=$PWD/runs/etcd1-e100-r100 -etcd-nodes=1 -executors=100 -run-onces=100
simulator -output-directory=$PWD/runs/etcd1-e100-r500 -etcd-nodes=1 -executors=100 -run-onces=500
simulator -output-directory=$PWD/runs/etcd1-e100-r1000 -etcd-nodes=1 -executors=100 -run-onces=1000

simulator -output-directory=$PWD/runs/etcd1-e200-r100 -etcd-nodes=1 -executors=200 -run-onces=100
simulator -output-directory=$PWD/runs/etcd1-e200-r500 -etcd-nodes=1 -executors=200 -run-onces=500
simulator -output-directory=$PWD/runs/etcd1-e200-r1000 -etcd-nodes=1 -executors=200 -run-onces=1000

simulator -output-directory=$PWD/runs/etcd1-e400-r100 -etcd-nodes=1 -executors=400 -run-onces=100
simulator -output-directory=$PWD/runs/etcd1-e400-r500 -etcd-nodes=1 -executors=400 -run-onces=500
simulator -output-directory=$PWD/runs/etcd1-e400-r1000 -etcd-nodes=1 -executors=400 -run-onces=1000
simulator -output-directory=$PWD/runs/etcd1-e400-r5000 -etcd-nodes=1 -executors=400 -run-onces=5000

simulator -output-directory=$PWD/runs/etcd3-e1-r1 -etcd-nodes=3 -executors=1 -run-onces=1
simulator -output-directory=$PWD/runs/etcd3-e1-r10 -etcd-nodes=3 -executors=1 -run-onces=10

simulator -output-directory=$PWD/runs/etcd3-e10-r10 -etcd-nodes=3 -executors=10 -run-onces=10
simulator -output-directory=$PWD/runs/etcd3-e10-r100 -etcd-nodes=3 -executors=10 -run-onces=100
simulator -output-directory=$PWD/runs/etcd3-e10-r500 -etcd-nodes=3 -executors=10 -run-onces=500
simulator -output-directory=$PWD/runs/etcd3-e10-r1000 -etcd-nodes=3 -executors=10 -run-onces=1000

simulator -output-directory=$PWD/runs/etcd3-e100-r100 -etcd-nodes=3 -executors=100 -run-onces=100
simulator -output-directory=$PWD/runs/etcd3-e100-r500 -etcd-nodes=3 -executors=100 -run-onces=500
simulator -output-directory=$PWD/runs/etcd3-e100-r1000 -etcd-nodes=3 -executors=100 -run-onces=1000

simulator -output-directory=$PWD/runs/etcd3-e200-r100 -etcd-nodes=3 -executors=200 -run-onces=100
simulator -output-directory=$PWD/runs/etcd3-e200-r500 -etcd-nodes=3 -executors=200 -run-onces=500
simulator -output-directory=$PWD/runs/etcd3-e200-r1000 -etcd-nodes=3 -executors=200 -run-onces=1000

simulator -output-directory=$PWD/runs/etcd3-e400-r100 -etcd-nodes=3 -executors=400 -run-onces=100
simulator -output-directory=$PWD/runs/etcd3-e400-r500 -etcd-nodes=3 -executors=400 -run-onces=500
simulator -output-directory=$PWD/runs/etcd3-e400-r1000 -etcd-nodes=3 -executors=400 -run-onces=1000
simulator -output-directory=$PWD/runs/etcd3-e400-r5000 -etcd-nodes=3 -executors=400 -run-onces=5000