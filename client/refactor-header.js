import fs from 'fs';

const filePath = '/Users/apple/workspace/taskio/client/components/project/ProjectHeader.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Imports
content = content.replace(
  'import AddProjectMemberModal from "@/components/modals/AddProjectMemberModal";',
  'import AddProjectMemberModal from "@/components/modals/AddProjectMemberModal";\nimport Button from "@/components/ui/Button";\nimport { Avatar } from "@/components/ui/Avatar";\nimport { Modal } from "@/components/ui/Modal";'
);

// IconBtn
content = content.replace(/<IconBtn /g, '<Button variant="icon" ');
content = content.replace(/<\/IconBtn>/g, '</Button>');
content = content.replace(/const IconBtn = styled\.div`[\s\S]*?`;\n\n/g, '');

// AddMemberButton
content = content.replace(/<AddMemberButton onClick=\{\(\) => setShowAddMember\(true\)\}>\s*<Plus size=\{14\} \/>\s*Add Member\s*<\/AddMemberButton>/g, '<Button variant="primary" icon={<Plus size={14} />} onClick={() => setShowAddMember(true)}>Add Member</Button>');
content = content.replace(/const AddMemberButton = styled\.button`[\s\S]*?`;\n\n/g, '');

// InviteButton
content = content.replace(/<InviteButton onClick=\{\(\) => setShowInvite\(!showInvite\)\}>\s*<Plus size=\{14\} \/>\s*Invite Code\s*<\/InviteButton>/g, '<Button variant="outline" icon={<Plus size={14} />} onClick={() => setShowInvite(!showInvite)}>Invite Code</Button>');
content = content.replace(/const InviteButton = styled\.button`[\s\S]*?`;\n\n/g, '');

// RefreshBtn
content = content.replace(/<RefreshBtn /g, '<Button variant="ghost" size="icon" ');
content = content.replace(/<\/RefreshBtn>/g, '</Button>');
content = content.replace(/const RefreshBtn = styled\.button`[\s\S]*?`;\n\n/g, '');

// CopyButton
content = content.replace(/<CopyButton disabled=\{isExpired\} onClick=\{handleCopyInvite\}>\s*\{copied \? <Check size=\{14\} \/> : <Copy size=\{14\} \/>\}\s*\{copied \? "Copied!" : "Copy Code"\}\s*<\/CopyButton>/g, '<Button variant="primary" size="sm" icon={copied ? <Check size={14} /> : <Copy size={14} />} disabled={isExpired} onClick={handleCopyInvite}>{copied ? "Copied!" : "Copy Code"}</Button>');
content = content.replace(/const CopyButton = styled\.button`[\s\S]*?`;\n\n/g, '');

// Members Avatar
content = content.replace(/<Avatar key=\{m\.id\} src=\{m\.avatarUrl\} title=\{\`\$\{m\.fullName\} • \$\{m\.role\.toLowerCase\(\)\}\`\} \/>/g, '<Avatar key={m.id} src={m.avatarUrl} title={`${m.fullName} • ${m.role.toLowerCase()}`} size="md" />');
content = content.replace(/const Avatar = styled\.img`[\s\S]*?`;\n\n/g, '');

// AvatarSmall
content = content.replace(/<AvatarSmall src=\{member\.avatarUrl\} alt=\{member\.fullName\} \/>/g, '<Avatar src={member.avatarUrl} alt={member.fullName} size="md" />');
content = content.replace(/const AvatarSmall = styled\.img`[\s\S]*?`;\n\n/g, '');

// Modal logic (Delete Project)
const oldModal = `{showDeleteConfirm && (
              <ModalOverlay onClick={() => setShowDeleteConfirm(false)}>
                <DeletePopup onClick={(e) => e.stopPropagation()}>
                  <DeleteWarningTitle>Delete Project</DeleteWarningTitle>
                  <DeleteWarning>
                    Are you sure you want to delete <strong>{project.name}</strong>? 
                    This will permanently remove all tasks and data associated with this project.
                  </DeleteWarning>
                  <DeleteActions>
                    <CancelBtn onClick={() => setShowDeleteConfirm(false)}>Cancel</CancelBtn>
                    <ConfirmDeleteBtn onClick={handleDeleteProject} disabled={isDeleting}>
                      {isDeleting ? "Deleting..." : "Delete Project"}
                    </ConfirmDeleteBtn>
                  </DeleteActions>
                </DeletePopup>
              </ModalOverlay>
            )}`;

const newModal = `<Modal
              isOpen={showDeleteConfirm}
              onClose={() => setShowDeleteConfirm(false)}
              title="Delete Project"
              footer={
                <>
                  <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                  <Button variant="danger" isLoading={isDeleting} onClick={handleDeleteProject}>Delete Project</Button>
                </>
              }
            >
              <DeleteWarning>
                Are you sure you want to delete <strong>{project.name}</strong>? 
                This will permanently remove all tasks and data associated with this project.
              </DeleteWarning>
            </Modal>`;

content = content.replace(oldModal, newModal);
content = content.replace(/const DeletePopup = styled\.div`[\s\S]*?`;\n\n/g, '');
content = content.replace(/const ModalOverlay = styled\.div`[\s\S]*?`;\n\n/g, '');
content = content.replace(/const DeleteActions = styled\.div`[\s\S]*?`;\n\n/g, '');
content = content.replace(/const CancelBtn = styled\.button`[\s\S]*?`;\n\n/g, '');
content = content.replace(/const ConfirmDeleteBtn = styled\.button`[\s\S]*?`;\n\n/g, '');
content = content.replace(/const DeleteWarningTitle = styled\.h3`[\s\S]*?`;\n\n/g, '');

fs.writeFileSync(filePath, content);
console.log('Refactored ProjectHeader.tsx');
